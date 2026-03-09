import axiosInstance from '@/lib/axios'

// ── Interfaces sesuai ERD Schedules ───────────────────────────
export interface Schedule {
  id: number
  title: string
  description: string
  start_time: string   // "HH:mm" (display)
  end_time: string     // "HH:mm" (display)
  date: string         // "YYYY-MM-DD"
  employee_id: number  // integer sesuai API
  type: 'meeting' | 'working' | 'personal' | 'holiday'
  employee?: {
    id: number
    full_name: string
    employee_code: string
    email: string
  }
  tagged_employees?: Array<{
    id: number
    full_name: string
    employee_code: string
  }>
}

export interface CreateSchedulePayload {
  title: string
  description: string
  start_time: string
  end_time: string
  date: string
  tagged_ids: number[]
  employee_id?: number
}

// Pastikan format waktu HH:mm:ss (API butuh detik)
function toTimeWithSeconds(t: string): string {
  return t.length === 5 ? `${t}:00` : t
}

function toTimeDisplay(t: string): string {
  return t ? t.slice(0, 5) : '00:00'
}

function normaliseSchedule(raw: any): Schedule {
  return {
    id: Number(raw.id ?? 0),
    title: raw.title ?? '',
    description: raw.description ?? '',
    start_time: toTimeDisplay(raw.start_time ?? '00:00'),
    end_time: toTimeDisplay(raw.end_time ?? '00:00'),
    date: (raw.date ?? '').slice(0, 10),
    employee_id: Number(raw.employee_id ?? 0),
    type: raw.type ?? 'working',
    employee: raw.employee,
    tagged_employees: raw.tagged_employees,
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
      return raw.map(normaliseSchedule)
    } catch (err) {
      console.warn('[scheduleService] GET /api/schedules/ failed:', err)
      return []
    }
  },

  async createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
<<<<<<< HEAD
    const apiPayload: any = {
      title: payload.title,
      description: payload.description,
      start_time: toTimeWithSeconds(payload.start_time),
      end_time: toTimeWithSeconds(payload.end_time),
      date: payload.date,
=======
    try {
      // Backend TIDAK punya field `type` — hapus dari payload API
      const { type, ...rest } = payload
      const apiPayload = {
        title: rest.title,
        description: rest.description,
        start_time: toTimeWithSeconds(rest.start_time),
        end_time: toTimeWithSeconds(rest.end_time),
        date: rest.date,
        employee_id: Number(rest.employee_id),
        tagged_ids: (rest.tagged_ids ?? []).map(Number),
      }
      console.log('[scheduleService] POST /api/schedules/create', apiPayload)
      const response = await axiosInstance.post('/api/schedules/create', apiPayload)
      const created = normaliseSchedule(raw)
      // Simpan `type` ke localStorage sebagai metadata frontend-only
      created.type = type
      const existing = lsGetAll()
      lsSave([...existing.filter((s) => s.schedule_id !== created.schedule_id), created])
      return created
