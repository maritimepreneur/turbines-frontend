'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, CheckSquare, Square, X, Star, Loader2 } from 'lucide-react';
import { fetchGoogleHolidays, getMonthRange, type GoogleHoliday } from '@/services/googleCalendarService';
import { useSchedules, useCreateSchedule } from '@/hooks/useSchedules';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/lib/axios';
import type { Schedule } from '@/services/scheduleService';

// ============================================================
// Interface TaskItem (lokal, belum ada di DB)
// ============================================================
interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

// ============================================================
// Constants
// ============================================================
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_OF_WEEK_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SCHEDULE_TYPE_COLORS: Record<string, { dot: string; border: string; bg: string; text: string }> = {
  meeting:  { dot: 'bg-blue-500',    border: 'border-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700'    },
  working:  { dot: 'bg-emerald-500', border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  personal: { dot: 'bg-rose-500',    border: 'border-rose-500',    bg: 'bg-rose-50',    text: 'text-rose-700'    },
  holiday:  { dot: 'bg-red-500',     border: 'border-red-500',     bg: 'bg-red-50',     text: 'text-red-700'     },
};

const BADGE_COLORS: Record<string, string> = {
  Work:     'bg-emerald-100 text-emerald-700',
  Weekend:  'bg-slate-200 text-slate-500',
  Meeting:  'bg-blue-100 text-blue-700',
  Personal: 'bg-rose-100 text-rose-700',
  Holiday:  'bg-red-100 text-red-700',
};

const DUMMY_TASKS: TaskItem[] = [
  { id: 't1', title: 'Send monthly report', completed: true },
  { id: 't2', title: 'Update project documentation', completed: false },
  { id: 't3', title: 'Call HR regarding onboarding', completed: false },
];

// ============================================================
// Helper functions
// ============================================================
function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ============================================================
// Component: CalendarPage
// ============================================================
export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [tasks, setTasks]               = useState<TaskItem[]>(DUMMY_TASKS);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showSidebar, setShowSidebar]   = useState(false);
  const [holidays, setHolidays]         = useState<GoogleHoliday[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(false);

  // ── API hooks ─────────────────────────────────────────────
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules(isAdmin);
  const createSchedule = useCreateSchedule();

  // ── Resolve employee_id based on role ──────────────────────
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    if (isAdmin) {
      // Admin: coba beberapa variasi endpoint untuk dapat semua employee
      const tryFetchEmployees = async () => {
        const endpoints = [
          '/api/employees/',
          '/api/employees/?limit=200',
          '/api/employees/?page=1&limit=200',
        ];
        for (const endpoint of endpoints) {
          try {
            const res = await axiosInstance.get(endpoint);
            const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
            if (raw.length > 0) {
              setEmployeeList(raw);
              setEmployeeId(raw[0].id);
              console.log('[Calendar] Employee list from', endpoint, ':', raw.length, 'items');
              return; // berhasil, stop
            }
          } catch (err: any) {
            console.warn('[Calendar] Failed', endpoint, ':', err?.response?.status);
          }
        }
        // Semua endpoint gagal → fallback ke schedule data (handled by effectiveEmployeeList)
        console.warn('[Calendar] All employee endpoints failed, will use schedule data as fallback');
      };
      tryFetchEmployees();
    } else {
      // Employee: fetch profil sendiri untuk dapat employee_id
      axiosInstance.get('/api/employees/profile')
        .then((res) => {
          const profile = res.data?.data ?? res.data;
          if (profile?.id) {
            setEmployeeId(profile.id);
            console.log('[Calendar] employee_id from profile:', profile.id);
          }
        })
        .catch(() => {
          // Fallback ke partner_id dari user jika profil gagal
          if (user?.partner_id) {
            setEmployeeId(user.partner_id);
            console.log('[Calendar] Fallback to partner_id:', user.partner_id);
          }
        });
    }
  }, [user?.id, isAdmin]);

  // ── New event form state ───────────────────────────────────
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: '09:00',
    end_time: '10:00',
    type: 'meeting' as Schedule['type'],
  });
  const [taggedIds, setTaggedIds] = useState<number[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  // ── Build employee list dari schedules jika /api/employees/ gagal ──
  // Ambil dari: 1) employee (owner) di setiap schedule, 2) tagged_employees di setiap schedule
  const employeeListFromSchedules = useMemo(() => {
    const seen = new Set<number>();
    const list: any[] = [];

    const addEmployee = (emp: any) => {
      if (emp?.id && !seen.has(emp.id)) {
        seen.add(emp.id);
        list.push({
          id: emp.id,
          full_name: emp.full_name ?? '',
          employee_code: emp.employee_code ?? '',
          email: emp.email ?? '',
        });
      }
    };

    schedules.forEach((s) => {
      // Tambahkan owner schedule
      if (s.employee) addEmployee(s.employee);
      // Tambahkan semua tagged_employees
      if (s.tagged_employees?.length) {
        s.tagged_employees.forEach(addEmployee);
      }
    });

    console.log('[Calendar] employeeListFromSchedules:', list.length, 'unique employees');
    return list;
  }, [schedules]);

  // Source akhir: pakai employeeList jika ada, fallback ke data dari schedules
  const effectiveEmployeeList = employeeList.length > 0 ? employeeList : employeeListFromSchedules;

  // Set employeeId default untuk admin jika belum ter-set
  useEffect(() => {
    if (isAdmin && employeeId === 0 && effectiveEmployeeList.length > 0) {
      setEmployeeId(effectiveEmployeeList[0].id);
      console.log('[Calendar] Admin employeeId fallback from schedules:', effectiveEmployeeList[0].full_name);
    }
  }, [isAdmin, employeeId, effectiveEmployeeList]);

  // ── Employee list untuk tagging ───────────────────────────
  // Admin: `employeeList` sudah di-fetch oleh useEffect di atas
  // Employee: fetch sendiri (bisa 403 jika tidak ada akses)
  const [allEmployeesForTag, setAllEmployeesForTag] = useState<any[]>([]);
  useEffect(() => {
    if (isAdmin) return; // Admin sudah punya employeeList
    axiosInstance.get('/api/employees/')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setAllEmployeesForTag(list);
      })
      .catch(() => {
        setAllEmployeesForTag([]);
      });
  }, [isAdmin]);

  // Gunakan effectiveEmployeeList (admin) atau allEmployeesForTag (employee)
  const tagEmployeeSource = effectiveEmployeeList.length > 0 ? effectiveEmployeeList : allEmployeesForTag;

  // Debug
  console.log('[Calendar] tagEmployeeSource:', tagEmployeeSource.length, 'isAdmin:', isAdmin, 'employeeList:', employeeList.length, 'fromSchedules:', employeeListFromSchedules.length);

  // Filtered list berdasarkan search, exclude employee yang sudah di-assign (admin)
  const tagSearchResults = tagEmployeeSource.filter((e) =>
    e.full_name?.toLowerCase().includes(tagSearch.toLowerCase()) &&
    !taggedIds.includes(e.id) &&
    e.id !== employeeId          // jangan tampilkan employee yang sudah di-assign
  ).slice(0, 6); // max 6 hasil

  // ── Fetch Google Calendar holidays ────────────────────────
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY;
    if (!apiKey) return;

    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const { timeMin, timeMax } = getMonthRange(year, month);

    setHolidaysLoading(true);
    fetchGoogleHolidays(apiKey, timeMin, timeMax)
      .then((data) => setHolidays(data))
      .catch(() => setHolidays([]))
      .finally(() => setHolidaysLoading(false));
  }, [currentDate]);

  // ── Calendar grid ─────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const year  = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay    = new Date(year, month, 1);
    const lastDay     = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayOfWeek  = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate    = prevLastDay.getDate();

    const days: { date: number; month: 'prev' | 'current' | 'next'; fullDate: Date }[] = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--)
      days.push({ date: prevLastDate - i, month: 'prev', fullDate: new Date(year, month - 1, prevLastDate - i) });
    for (let i = 1; i <= lastDateOfMonth; i++)
      days.push({ date: i, month: 'current', fullDate: new Date(year, month, i) });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++)
      days.push({ date: i, month: 'next', fullDate: new Date(year, month + 1, i) });

    return days;
  }, [currentDate]);

  // ── Index holidays by date ────────────────────────────────
  const holidaysByDate = useMemo(() => {
    const map = new Map<string, GoogleHoliday[]>();
    holidays.forEach((h) => {
      const list = map.get(h.date) || [];
      list.push(h);
      map.set(h.date, list);
    });
    return map;
  }, [holidays]);

  // ── Filter schedules: tampilkan milik sendiri + yang di-tag ─
  const visibleSchedules = useMemo(() => {
    if (isAdmin) return schedules; // Admin lihat semua
    if (!employeeId) return schedules; // Belum resolve → tampil semua dulu
    return schedules.filter((s) =>
      s.employee_id === employeeId ||          // Schedule milik sendiri
      s.tagged_ids?.includes(employeeId)       // Atau di-tag di schedule orang lain
    );
  }, [schedules, employeeId, isAdmin]);

  // ── Index schedules by date ───────────────────────────────
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    visibleSchedules.forEach((s) => {
      const list = map.get(s.date) || [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, [visibleSchedules]);

  const selectedDateSchedules = useMemo(
    () => schedulesByDate.get(toDateKey(selectedDate)) || [],
    [selectedDate, schedulesByDate],
  );

  const selectedDateHolidays = useMemo(
    () => holidaysByDate.get(toDateKey(selectedDate)) || [],
    [selectedDate, holidaysByDate],
  );

  // ── Navigation ────────────────────────────────────────────
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }, []);

  // ── Task toggle ───────────────────────────────────────────
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  // ── Create event handler ──────────────────────────────────
  const handleCreateEvent = async () => {
    if (!newEvent.title.trim()) return;

    // DEBUG: tampilkan IDs yang akan dikirim
    console.log('[Calendar] Creating event:');
    console.log('  employee_id (assigned to):', employeeId);
    console.log('  tagged_ids:', taggedIds);
    console.log('  tagged names:', taggedIds.map(id => {
      const emp = tagEmployeeSource.find((e: any) => e.id === id);
      return `${id} (${emp?.full_name ?? 'unknown'})`;
    }));
    console.log('  tagEmployeeSource sample:', tagEmployeeSource.slice(0, 3).map((e: any) => `id:${e.id} name:${e.full_name}`));

    await createSchedule.mutateAsync({
      title:       newEvent.title.trim(),
      description: newEvent.description.trim(),
      start_time:  newEvent.start_time,
      end_time:    newEvent.end_time,
      date:        toDateKey(selectedDate),
      type:        newEvent.type,
      tagged_ids:  taggedIds,
      employee_id: employeeId,
    });

    // Reset form & tutup modal
    setNewEvent({ title: '', description: '', start_time: '09:00', end_time: '10:00', type: 'meeting' });
    setTaggedIds([]);
    setTagSearch('');
    setTagDropdownOpen(false);
    setShowNewEventModal(false);
  };

  // ── Helpers ───────────────────────────────────────────────
  const selectedDayLabel = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${dayNames[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getDate()}`;
  }, [selectedDate]);

  const getBadge = (s: Schedule) => {
    const colors = SCHEDULE_TYPE_COLORS[s.type] ?? SCHEDULE_TYPE_COLORS['working'];
    return (
      <span key={s.schedule_id} className={`hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
        {s.title}
      </span>
    );
  };

  const getDot = (s: Schedule) => {
    const colors = SCHEDULE_TYPE_COLORS[s.type];
    return <span key={s.schedule_id} className={`w-1.5 h-1.5 rounded-full ${colors.dot} sm:hidden`} />;
  };

  // ── Sidebar content (shared desktop + mobile sheet) ───────
  const SidebarContent = () => (
    <div className="space-y-5">
      {/* Today's Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-1">Today&apos;s Schedule</p>
        <h3 className="text-xl font-bold text-slate-800 mb-4">{selectedDayLabel}</h3>

        {/* Loading state */}
        {schedulesLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-2 animate-pulse">
            <Loader2 size={14} className="animate-spin" />
            Loading schedules...
          </div>
        )}

        {/* Holiday cards */}
        {selectedDateHolidays.length > 0 && (
          <div className="space-y-2 mb-3">
            {selectedDateHolidays.map((h) => {
              const colors = SCHEDULE_TYPE_COLORS['holiday'];
              return (
                <div key={h.id} className={`rounded-lg border-l-4 ${colors.border} ${colors.bg} p-3`}>
                  <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-red-500" />
                    <p className="font-semibold text-red-700 text-sm">{h.title}</p>
                  </div>
                  {h.description && <p className="text-xs text-red-500 mt-1 ml-5">{h.description}</p>}
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-1.5 ml-5">Public Holiday</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Schedule cards */}
        {!schedulesLoading && selectedDateSchedules.length > 0 ? (
          <div className="space-y-3">
            {selectedDateSchedules.map((s) => {
              const colors = SCHEDULE_TYPE_COLORS[s.type] ?? SCHEDULE_TYPE_COLORS['working'];
              // Cari nama employee dari effectiveEmployeeList (admin)
              const empName = isAdmin
                ? (effectiveEmployeeList.find((e: any) => e.id === s.employee_id)?.full_name
                    ?? s.employee?.full_name
                    ?? `Employee #${s.employee_id}`)
                : null;
              // Cek apakah type dari localStorage (bukan default)
              const hasLocalType = !s.schedule_id.startsWith('local_')
                ? typeof window !== 'undefined' && (() => {
                    try { const ls = JSON.parse(localStorage.getItem('turbines_schedules') || '[]'); return ls.some((l: any) => l.schedule_id === s.schedule_id && l.type); } catch { return false; }
                  })()
                : true;
              // Cek apakah employee di-tag (bukan owner)
              const isTagged = !isAdmin && employeeId > 0 && s.employee_id !== employeeId && s.tagged_ids?.includes(employeeId);
              // Nama owner schedule (untuk card yang di-tag)
              const ownerName = isTagged
                ? (s.employee?.full_name ?? tagEmployeeSource.find((e: any) => e.id === s.employee_id)?.full_name ?? `Employee #${s.employee_id}`)
                : null;
              // Resolve daftar tagged employees untuk ditampilkan
              const taggedEmpList = s.tagged_employees && s.tagged_employees.length > 0
                ? s.tagged_employees
                : s.tagged_ids?.map((tid) => {
                    const found = tagEmployeeSource.find((e: any) => e.id === tid);
                    return found ? { id: tid, full_name: found.full_name, employee_code: found.employee_code } : null;
                  }).filter(Boolean) ?? [];
              return (
                <div key={s.schedule_id} className={`rounded-lg border-l-4 ${colors.border} ${colors.bg} p-3`}>
                  {/* Admin: tampilkan nama employee */}
                  {isAdmin && empName && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-bold bg-slate-700 text-white px-2 py-0.5 rounded-full">
                        👤 {empName}
                      </span>
                    </div>
                  )}
                  {/* Employee: tampilkan badge "Tagged" + nama owner */}
                  {isTagged && (
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        🔖 Tagged
                      </span>
                      {ownerName && (
                        <span className="text-[10px] text-slate-400">by {ownerName}</span>
                      )}
                    </div>
                  )}
                  <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {formatTime12(s.start_time)} - {formatTime12(s.end_time)}
                    </span>
                    {/* Type badge — hanya tampil jika type sudah di-set (ada di localStorage) */}
                    {hasLocalType && (
                      <span className={`ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {s.type}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                  )}
                  {/* Tagged employees */}
                  {taggedEmpList.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/70">
                      <p className="text-[10px] text-slate-400 mb-1.5">🔖 Tagged</p>
                      <div className="flex flex-wrap gap-1">
                        {(taggedEmpList as any[]).map((emp) => (
                          <span
                            key={emp.id}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-blue-100"
                          >
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-200 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                              {emp.full_name?.[0]?.toUpperCase()}
                            </span>
                            {emp.full_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : !schedulesLoading && selectedDateHolidays.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No schedules for this day</p>
        ) : null}

        {holidaysLoading && (
          <p className="text-xs text-slate-400 text-center mt-2 animate-pulse">Loading holidays...</p>
        )}
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Task List</p>
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="flex items-center gap-3 w-full text-left group/task"
            >
              {task.completed ? (
                <CheckSquare size={20} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <Square size={20} className="text-slate-300 group-hover/task:text-slate-400 flex-shrink-0 transition-colors" />
              )}
              <span className={`text-sm transition-colors ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.title}
              </span>
            </button>
          ))}
        </div>
        <button className="w-full mt-4 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          View Full Schedule
        </button>
      </div>

      {/* Quick Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Quick Legend</p>
        <div className="flex flex-wrap items-center gap-4">
          {Object.entries(SCHEDULE_TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className="text-sm text-slate-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ===== Top Header ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Workspace Calendar</h1>
          <p className="text-xs sm:text-sm text-slate-400">Manage your schedule and daily tasks</p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 flex-wrap">
          <h2 className="text-base sm:text-xl font-semibold text-slate-700">
            {MONTH_NAMES[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}
          </h2>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            <button onClick={goToPreviousMonth} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-md transition" aria-label="Previous month">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <button onClick={goToToday} className="px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition">
              Today
            </button>
            <button onClick={goToNextMonth} className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-md transition" aria-label="Next month">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>

          <button
            onClick={() => setShowNewEventModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition shadow-md hover:shadow-lg"
          >
            <Plus size={14} />
            New Event
          </button>

          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition hover:bg-slate-50"
          >
            <Clock size={14} />
            Schedule
          </button>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ===== Calendar Grid ===== */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-w-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DAYS_OF_WEEK.map((day, i) => (
              <div key={day} className="py-2 sm:py-3 text-center text-[9px] sm:text-xs font-bold text-slate-400 tracking-widest uppercase">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{DAYS_OF_WEEK_SHORT[i]}</span>
              </div>
            ))}
          </div>

          {/* Loading overlay */}
          {schedulesLoading && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-400 animate-pulse border-b border-slate-100">
              <Loader2 size={12} className="animate-spin" />
              Loading schedules from API...
            </div>
          )}

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const key          = toDateKey(day.fullDate);
              const daySchedules = schedulesByDate.get(key) || [];
              const dayHolidays  = holidaysByDate.get(key) || [];
              const isCurrentMonth = day.month === 'current';
              const isTodayDate    = isSameDay(day.fullDate, today);
              const isSelected     = isSameDay(day.fullDate, selectedDate);
              const hasHoliday     = dayHolidays.length > 0;
              const hasEvent       = daySchedules.length > 0 || hasHoliday;

              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(day.fullDate);
                    if (day.month === 'prev') goToPreviousMonth();
                    if (day.month === 'next') goToNextMonth();
                  }}
                  className={`
                    relative min-h-[56px] sm:min-h-[90px] md:min-h-[100px] p-1.5 sm:p-2.5
                    border-b border-r border-slate-100 text-left transition-colors
                    hover:bg-slate-50 group
                    ${!isCurrentMonth ? 'bg-slate-50/60' : hasHoliday ? 'bg-red-50/40' : 'bg-white'}
                    ${isSelected ? 'ring-2 ring-blue-400 ring-inset z-10' : ''}
                  `}
                >
                  <span
                    className={`
                      text-xs sm:text-sm font-semibold inline-flex items-center justify-center
                      ${!isCurrentMonth ? 'text-slate-300' : hasHoliday ? 'text-red-500' : 'text-slate-700'}
                      ${isTodayDate ? 'bg-blue-500 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7' : ''}
                    `}
                  >
                    {day.date}
                  </span>

                  {/* Mobile: dots */}
                  {hasEvent && (
                    <div className="flex gap-0.5 mt-1 sm:hidden flex-wrap">
                      {dayHolidays.slice(0, 1).map((h) => (
                        <span key={h.id} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      ))}
                      {daySchedules.slice(0, 2).map((s) => getDot(s))}
                    </div>
                  )}

                  {/* Desktop: badges */}
                  <div className="mt-1 hidden sm:flex flex-col gap-0.5">
                    {dayHolidays.slice(0, 1).map((h) => (
                      <span key={h.id} className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${BADGE_COLORS['Holiday']}`}>
                        {h.title.length > 14 ? h.title.slice(0, 14) + '…' : h.title}
                      </span>
                    ))}
                    {daySchedules.slice(0, dayHolidays.length > 0 ? 1 : 2).map((s) => getBadge(s))}
                    {(daySchedules.length + dayHolidays.length) > 2 && (
                      <span className="text-[10px] text-slate-400 font-medium pl-1">
                        +{daySchedules.length + dayHolidays.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Hover add */}
                  <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-blue-500 text-white rounded-full p-0.5 shadow">
                      <Plus size={10} className="sm:hidden" />
                      <Plus size={12} className="hidden sm:block" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== Desktop Sidebar ===== */}
        <div className="hidden lg:block w-[310px] flex-shrink-0">
          <SidebarContent />
        </div>
      </div>

      {/* ===== Mobile Sidebar Sheet ===== */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[320px] max-w-full bg-slate-50 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
              <p className="font-semibold text-slate-800 text-sm">Schedule & Tasks</p>
              <button onClick={() => setShowSidebar(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                <X size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* ===== New Event Modal ===== */}
      {showNewEventModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-800">New Event</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDayLabel}</p>
              </div>
              <button onClick={() => setShowNewEventModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[70vh] sm:max-h-none overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Team Meeting"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Add a description..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Time — disembunyikan jika type = holiday */}
              {newEvent.type !== 'holiday' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                  </div>
                </div>
              )}

              {/* Label merah saat Day Off dipilih */}
              {newEvent.type === 'holiday' && (
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
                    <span>🏖️</span>
                    Day Off
                  </span>
                  <span className="text-xs text-slate-400">Berlaku sepanjang hari</span>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['meeting', 'working', 'personal', 'holiday'] as Schedule['type'][]).map((type) => {
                    const selected = newEvent.type === type;
                    const colors   = SCHEDULE_TYPE_COLORS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setNewEvent({
                          ...newEvent,
                          type,
                          ...(type === 'holiday'
                            ? { start_time: '00:00', end_time: '23:59' }
                            : { start_time: '09:00', end_time: '10:00' }
                          ),
                        })}
                        className={`
                          flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold border transition
                          ${selected
                            ? `${colors.bg} ${colors.border} ${colors.text} border-2`
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                        `}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                        <span className="capitalize">{type === 'holiday' ? 'Day Off' : type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Employee — selalu tampil untuk admin, tampil untuk employee jika ada akses */}
              {(isAdmin || tagEmployeeSource.length > 0) && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tag Employee
                    {taggedIds.length > 0 && (
                      <span className="ml-2 text-xs text-blue-500 font-normal">{taggedIds.length} tagged</span>
                    )}
                  </label>

                  {/* Tagged chips */}
                  {taggedIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {taggedIds.map((id) => {
                        const emp = tagEmployeeSource.find((e) => e.id === id);
                        return emp ? (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            👤 {emp.full_name}
                            <button
                              onClick={() => setTaggedIds((prev) => prev.filter((i) => i !== id))}
                              className="ml-0.5 hover:text-blue-900 transition"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Warning jika employee list belum loaded */}
                  {isAdmin && tagEmployeeSource.length === 0 && (
                    <p className="text-xs text-amber-500 mb-2">⚠️ Employee list sedang dimuat atau tidak tersedia...</p>
                  )}

                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => { setTagSearch(e.target.value); setTagDropdownOpen(true); }}
                      onFocus={() => setTagDropdownOpen(true)}
                      placeholder="Search employee name..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    />
                    {/* Dropdown hasil search */}
                    {tagDropdownOpen && tagSearch.length > 0 && (
                      <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                        {tagSearchResults.length > 0 ? (
                          tagSearchResults.map((emp) => (
                            <button
                              key={emp.id}
                              onClick={() => {
                                setTaggedIds((prev) => [...prev, emp.id]);
                                setTagSearch('');
                                setTagDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition text-left"
                            >
                              <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                {emp.full_name?.[0]?.toUpperCase()}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-slate-800">{emp.full_name}</p>
                                <p className="text-xs text-slate-400">{emp.employee_code}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400 text-center py-3">No employee found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50/50">
              <button
                onClick={() => setShowNewEventModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!newEvent.title.trim() || createSchedule.isPending}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-md"
              >
                {createSchedule.isPending && <Loader2 size={14} className="animate-spin" />}
                {createSchedule.isPending ? 'Saving...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}