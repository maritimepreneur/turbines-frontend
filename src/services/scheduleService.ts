import axiosInstance from '@/lib/axios'

// ── Interfaces sesuai API Backend ─────────────────────────────
export interface TaggedEmployee {
  id: number
  full_name: string
  employee_code: string
}

export interface ScheduleEmployee {
  id: number
  full_name: string
  employee_code: string
  email: string
}

export interface Schedule {
  schedule_id: string
  title: string
  description: string
  start_time: string   // "HH:mm" (display)
  end_time: string     // "HH:mm" (display)
  date: string         // "YYYY-MM-DD"
  tagged_ids: number[] // array of employee IDs
  tagged_employees: TaggedEmployee[] // detail nama employee yang di-tag
  employee_id: number  // owner dari schedule
  employee?: ScheduleEmployee // detail owner
  type: 'meeting' | 'working' | 'personal' | 'holiday'
}

export interface CreateSchedulePayload {
  title: string
  description: string
  start_time: string   // "HH:mm" → akan diformat jadi "HH:mm:ss"
  end_time: string     // "HH:mm" → akan diformat jadi "HH:mm:ss"
  date: string         // "YYYY-MM-DD"
  tagged_ids?: number[]
  employee_id?: number // optional, backend ambil dari JWT
  type: 'meeting' | 'working' | 'personal' | 'holiday'
}

// Pastikan format waktu HH:mm:ss (API butuh detik)
function toTimeWithSeconds(t: string): string {
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
  // tagged_employees bisa array object {id, full_name, employee_code}
  const taggedEmployees: TaggedEmployee[] = Array.isArray(raw.tagged_employees)
    ? raw.tagged_employees
    : []
  // Extract tagged_ids dari tagged_employees jika tagged_ids kosong
  const taggedIds = Array.isArray(raw.tagged_ids) && raw.tagged_ids.length > 0
    ? raw.tagged_ids.map(Number)
    : taggedEmployees.map((e) => e.id)

  return {
    schedule_id: String(raw.schedule_id ?? raw.id ?? ''),
    title: raw.title ?? '',
    description: raw.description ?? '',
    start_time: toTimeDisplay(raw.start_time ?? '00:00'),
    end_time: toTimeDisplay(raw.end_time ?? '00:00'),
    date: (raw.date ?? '').slice(0, 10),
    tagged_ids: taggedIds,
    tagged_employees: taggedEmployees,
    employee_id: Number(raw.employee_id ?? raw.employee?.id ?? 0),
    employee: raw.employee ?? undefined,
    type: raw.type ?? 'working',
  }
}

// ── Service ───────────────────────────────────────────────────
export const scheduleService = {
  async getSchedules(isAdmin?: boolean): Promise<Schedule[]> {
    let apiData: Schedule[] = []

    try {
      // Admin: GET /api/schedules/ (semua schedule)
      // Employee: GET /api/schedules/employee (milik sendiri + yang di-tag)
      const endpoint = isAdmin ? '/api/schedules/' : '/api/schedules/employee'
      const response = await axiosInstance.get(endpoint)
      const raw = Array.isArray(response.data)
        ? response.data
        : (response.data?.data ?? [])
      apiData = raw.map((item: any) => {
        const inner = item?.data ?? item
        return normaliseSchedule(inner)
      })
      console.log(`[scheduleService] GET ${endpoint} OK:`, apiData.length, 'items')
    } catch (err: any) {
      console.warn('[scheduleService] GET schedules failed:', err?.response?.status, '- using localStorage')
      return lsGetAll()
    }

    // Merge `type` dari localStorage (backend tidak punya field type)
    const localData = lsGetAll()
    const localByKey = new Map(localData.map((s) => [s.schedule_id, s]))
    apiData.forEach((s: Schedule) => {
      const local = localByKey.get(s.schedule_id)
      if (local?.type) {
        s.type = local.type
      }
    })

    // Tambahkan data lokal-only (yg belum pernah ke API)
    const apiIds = new Set(apiData.map((s: Schedule) => s.schedule_id))
    const localOnly = localData.filter((s) => !apiIds.has(s.schedule_id) && s.schedule_id.startsWith('local_'))
    return [...apiData, ...localOnly]
  },

  async createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
    try {
      // Backend format sesuai Swagger:
      // - Tidak kirim employee_id (backend ambil dari JWT/token)
      // - Tidak kirim type (frontend-only metadata)
      // - date format: "YYYY-MM-DDT{start_time}"
      const apiPayload: Record<string, any> = {
        title: payload.title,
        description: payload.description,
        start_time: toTimeWithSeconds(payload.start_time),
        end_time: toTimeWithSeconds(payload.end_time),
        date: `${payload.date}T${toTimeWithSeconds(payload.start_time)}`,
        tagged_ids: (payload.tagged_ids ?? []).map(Number),
      }
      // Admin: kirim employee_id supaya backend tahu schedule untuk employee siapa
      if (payload.employee_id) {
        apiPayload.employee_id = Number(payload.employee_id)
      }
      console.log('[scheduleService] POST /api/schedules/create', apiPayload)
      const response = await axiosInstance.post('/api/schedules/create', apiPayload)
      const raw = response.data?.data ?? response.data
      const created = normaliseSchedule(raw)
      // Simpan `type` ke localStorage sebagai metadata frontend-only
      created.type = payload.type
      const existing = lsGetAll()
      lsSave([...existing.filter((s) => s.schedule_id !== created.schedule_id), created])
      return created
    } catch (err: any) {
      console.error('[scheduleService] createSchedule error:', err?.response?.data ?? err?.message)
      // Fallback localStorage jika API gagal
      console.warn('[scheduleService] POST /api/schedules/create failed, saving to localStorage')
      const newSchedule: Schedule = {
        schedule_id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: payload.title,
        description: payload.description,
        start_time: toTimeDisplay(payload.start_time),
        end_time: toTimeDisplay(payload.end_time),
        date: payload.date,
        tagged_ids: (payload.tagged_ids ?? []).map(Number),
        tagged_employees: [],
        employee_id: Number(payload.employee_id ?? 0),
        type: payload.type,
      }
      const existing = lsGetAll()
      lsSave([...existing, newSchedule])
      return newSchedule
    }
  },

  async updateSchedule(id: string, payload: Partial<CreateSchedulePayload>): Promise<Schedule> {
    try {
      // Backend hanya terima: title, description, start_time, end_time, date, tagged_ids
      const { type, employee_id, ...rest } = payload as any
      const apiPayload: Record<string, any> = {}
      if (rest.title       !== undefined) apiPayload.title       = rest.title
      if (rest.description !== undefined) apiPayload.description = rest.description
      if (rest.start_time  !== undefined) apiPayload.start_time  = toTimeWithSeconds(rest.start_time)
      if (rest.end_time    !== undefined) apiPayload.end_time    = toTimeWithSeconds(rest.end_time)
      if (rest.date        !== undefined) apiPayload.date        = rest.date
      if (rest.tagged_ids  !== undefined) apiPayload.tagged_ids  = (rest.tagged_ids ?? []).map(Number)

      console.log('[scheduleService] PUT /api/schedules/' + id, apiPayload)
      const response = await axiosInstance.put(`/api/schedules/${id}`, apiPayload)
      const raw = response.data?.data ?? response.data
      const updated = normaliseSchedule(raw)

      // Simpan type ke localStorage jika ada (frontend-only metadata)
      if (type) {
        updated.type = type
        const existing = lsGetAll()
        lsSave([...existing.filter((s) => s.schedule_id !== id), updated])
      }
      return updated
    } catch (err: any) {
      console.error('[scheduleService] updateSchedule error:', err?.response?.data ?? err?.message)
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
