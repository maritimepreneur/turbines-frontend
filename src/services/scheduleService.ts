import axiosInstance from '@/lib/axios'

// ── Interfaces sesuai ERD Schedules ───────────────────────────
export interface Schedule {
  schedule_id: string
  title: string
  description: string
  start_time: string   // "HH:mm" (display)
  end_time: string     // "HH:mm" (display)
  date: string         // "YYYY-MM-DD"
  tagged_ids: number[] // integer array sesuai API
  employee_id: number  // integer sesuai API
  type: 'meeting' | 'working' | 'personal' | 'holiday'
}

export interface CreateSchedulePayload {
  title: string
  description: string
  start_time: string   // dikirim ke API sebagai "HH:mm:ss"
  end_time: string     // dikirim ke API sebagai "HH:mm:ss"
  date: string         // "YYYY-MM-DD"
  tagged_ids?: number[] // integer array
  employee_id: number   // integer, wajib
  type: 'meeting' | 'working' | 'personal' | 'holiday'
}

// Pastikan format waktu HH:mm:ss (API butuh detik)
function toTimeWithSeconds(t: string): string {
  // Jika sudah HH:mm:ss → biarkan, jika HH:mm → tambah :00
  return t.length === 5 ? `${t}:00` : t
}

// Potong detik untuk display HH:mm
function toTimeDisplay(t: string): string {
  return t ? t.slice(0, 5) : '00:00'
}

// ── localStorage key ──────────────────────────────────────────
const LS_KEY = 'turbines_schedules'

function lsGetAll(): Schedule[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function lsSave(data: Schedule[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(data))
}

// ── Normalise berbagai bentuk response API ─────────────────────
function normaliseSchedule(raw: any): Schedule {
  return {
    schedule_id: String(raw.schedule_id ?? raw.id ?? ''),
    title: raw.title ?? '',
    description: raw.description ?? '',
    // Potong menjadi HH:mm untuk display (API return HH:mm:ss)
    start_time: toTimeDisplay(raw.start_time ?? '00:00'),
    end_time: toTimeDisplay(raw.end_time ?? '00:00'),
    // API return date dengan waktu "2025-02-26 00:00:00" → ambil YYYY-MM-DD saja
    date: (raw.date ?? '').slice(0, 10),
    tagged_ids: Array.isArray(raw.tagged_ids) ? raw.tagged_ids.map(Number) : [],
    employee_id: Number(raw.employee_id ?? 0),
    type: raw.type ?? 'working',
  }
}

// ── Service ───────────────────────────────────────────────────
export const scheduleService = {
  async getSchedules(): Promise<Schedule[]> {
    try {
      const response = await axiosInstance.get('/api/schedules/')
      const raw = Array.isArray(response.data)
        ? response.data
        : (response.data?.data ?? [])
      const apiData = raw.map(normaliseSchedule)
      // Merge dengan localStorage (data lokal sementara)
      const localData = lsGetAll()
      const apiIds = new Set(apiData.map((s: Schedule) => s.schedule_id))
      const localOnly = localData.filter((s) => !apiIds.has(s.schedule_id))
      return [...apiData, ...localOnly]
    } catch {
      console.warn('[scheduleService] GET /api/schedules/ failed, using localStorage')
      return lsGetAll()
    }
  },

  async createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
    try {
      // Format waktu ke HH:mm:ss sesuai yang API harapkan
      const apiPayload = {
        ...payload,
        start_time: toTimeWithSeconds(payload.start_time),
        end_time: toTimeWithSeconds(payload.end_time),
        employee_id: Number(payload.employee_id),
        tagged_ids: (payload.tagged_ids ?? []).map(Number),
      }
      const response = await axiosInstance.post('/api/schedules/create', apiPayload)
      // API return code 201 saat sukses
      const raw = response.data?.data ?? response.data
      const created = normaliseSchedule(raw)
      // Hapus versi localStorage jika ada (bersihkan duplikat)
      return created
    } catch (err: any) {
      // Jika bukan 500 / network error → rethrow
      const status = err?.response?.status
      if (status && status < 500) throw err
      // Fallback localStorage jika server down
      console.warn('[scheduleService] POST /api/schedules/create failed, saving to localStorage')
      const newSchedule: Schedule = {
        schedule_id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: payload.title,
        description: payload.description,
        start_time: toTimeDisplay(payload.start_time),
        end_time: toTimeDisplay(payload.end_time),
        date: payload.date,
        tagged_ids: (payload.tagged_ids ?? []).map(Number),
        employee_id: Number(payload.employee_id),
        type: payload.type,
      }
      const existing = lsGetAll()
      lsSave([...existing, newSchedule])
      return newSchedule
    }
  },

  async updateSchedule(id: string, payload: Partial<CreateSchedulePayload>): Promise<Schedule> {
    try {
      const response = await axiosInstance.put(`/api/schedules/${id}`, payload)
      const raw = response.data?.data ?? response.data
      return normaliseSchedule(raw)
    } catch {
      // Fallback: update di localStorage
      const all = lsGetAll()
      const updated = all.map((s) =>
        s.schedule_id === id ? { ...s, ...payload } : s
      )
      lsSave(updated)
      return updated.find((s) => s.schedule_id === id)!
    }
  },

  async deleteSchedule(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/api/schedules/${id}`)
    } catch (err: any) {
      const status = err?.response?.status
      if (status && status >= 200 && status < 300) return
      // Fallback: hapus dari localStorage
      const all = lsGetAll()
      lsSave(all.filter((s) => s.schedule_id !== id))
    }
  },
}

