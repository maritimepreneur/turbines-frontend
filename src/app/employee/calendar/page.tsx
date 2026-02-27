'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, CheckSquare, Square, X, Star, Loader2 } from 'lucide-react';
import { fetchGoogleHolidays, getMonthRange, type GoogleHoliday } from '@/services/googleCalendarService';
import { useSchedules, useCreateSchedule } from '@/hooks/useSchedules';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import type { Schedule, CreateSchedulePayload } from '@/services/scheduleService';

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
  const { data: schedules = [], isLoading: schedulesLoading } = useSchedules();
  const { data: employees = [] } = useEmployees();
  const createSchedule = useCreateSchedule();
  const { user } = useAuth();

  // ── New event form state ───────────────────────────────────
  const [newEvent, setNewEvent] = useState<Omit<CreateSchedulePayload, 'date'>>({
    title: '',
    description: '',
    start_time: '09:00',
    end_time: '10:00',
    tagged_ids: [],
  });

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

  // ── Index schedules by date ───────────────────────────────
  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    schedules.forEach((s) => {
      const list = map.get(s.date) || [];
      list.push(s);
      map.set(s.date, list);
    });
    return map;
  }, [schedules]);

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
    if (!newEvent.title.trim() || !user?.id) return;

    await createSchedule.mutateAsync({
      title: newEvent.title.trim(),
      description: newEvent.description.trim(),
      start_time: newEvent.start_time,
      end_time: newEvent.end_time,
      date: toDateKey(selectedDate),
      employee_id: user.id,
      tagged_ids: newEvent.tagged_ids,
    });

    setNewEvent({ title: '', description: '', start_time: '09:00', end_time: '10:00', tagged_ids: [] });
    setShowNewEventModal(false);
  };

  // ── Helpers ───────────────────────────────────────────────
  const selectedDayLabel = useMemo(() => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${dayNames[selectedDate.getDay()]}, ${MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getDate()}`;
  }, [selectedDate]);

  const getBadge = (s: Schedule) => {
    const typeMap: Record<Schedule['type'], string> = {
      meeting: 'Meeting',
      working: 'Work',
      personal: 'Personal',
      holiday: 'Holiday',
    };
    const label = typeMap[s.type] || 'Work';
    const color = BADGE_COLORS[label] || BADGE_COLORS['Work'];
    return (
      <span key={s.id} className={`hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${color}`}>
        {s.title}
      </span>
    );
  };

  const getDot = (s: Schedule) => {
    const colors = SCHEDULE_TYPE_COLORS[s.type];
    return <span key={s.id} className={`w-1.5 h-1.5 rounded-full ${colors.dot} sm:hidden`} />;
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
              return (
                <div key={s.id} className={`rounded-lg border-l-4 ${colors.border} ${colors.bg} p-3`}>
                  <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {formatTime12(s.start_time)} - {formatTime12(s.end_time)}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-slate-400 mt-1">{s.description}</p>
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

              {/* Time */}
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

              {/* Tag Employees */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tag Employees</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg">
                  {employees.map((emp) => {
                    const isSelected = newEvent.tagged_ids.includes(emp.id);
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setNewEvent({
                            ...newEvent,
                            tagged_ids: isSelected
                              ? newEvent.tagged_ids.filter((id) => id !== emp.id)
                              : [...newEvent.tagged_ids, emp.id],
                          });
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {emp.full_name}
                      </button>
                    );
                  })}
                </div>
                {newEvent.tagged_ids.length > 0 && (
                  <p className="text-xs text-slate-400 mt-1">{newEvent.tagged_ids.length} employee(s) tagged</p>
                )}
              </div>
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
