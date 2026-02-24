// // lib/api/attendance.ts

// import {
//   AttendanceListResponse,
//   AttendanceStatusResponse,
//   AttendanceRecord,
//   FetchAttendancesParams,
//   ClockTime,
//   ApiError,
// } from '@/types/attendance'

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://turbines-murex.vercel.app'

// // Get auth token
// export const getAuthToken = (): string => {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''
//   }
//   return ''
// }

// // Handle API errors
// const handleApiError = async (response: Response): Promise<never> => {
//   let errorMessage = `HTTP error! status: ${response.status}`
  
//   try {
//     const errorData: ApiError = await response.json()
//     errorMessage = errorData.message || errorMessage
//   } catch {
//     // If JSON parsing fails, use default error message
//   }
  
//   throw new Error(errorMessage)
// }

// // Fetch attendances with filters
// export const fetchAttendances = async ({
//   page = 1,
//   limit = 25,
//   search = '',
//   date = '',
//   status = '',
// }: FetchAttendancesParams = {}): Promise<AttendanceListResponse> => {
//   try {
//     const token = getAuthToken()
//     const params = new URLSearchParams()
    
//     params.append('page', page.toString())
//     params.append('limit', limit.toString())
//     if (search) params.append('search', search)
//     if (date) params.append('date', date)
//     if (status) params.append('status', status)

//     const response = await fetch(`${API_BASE_URL}/api/attendances?${params}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//     })

//     if (!response.ok) {
//       await handleApiError(response)
//     }

//     const data: AttendanceListResponse = await response.json()
//     return data
//   } catch (error) {
//     console.error('Error fetching attendances:', error)
//     throw error
//   }
// }

// // Get today's attendance status
// export const getTodayAttendanceStatus = async (): Promise<AttendanceStatusResponse> => {
//   try {
//     const token = getAuthToken()
//     const response = await fetch(`${API_BASE_URL}/attendances/status`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     })

//     if (!response.ok) {
//       await handleApiError(response)
//     }

//     const data: AttendanceStatusResponse = await response.json()
//     return data
//   } catch (error) {
//     console.error('Error fetching attendance status:', error)
//     throw error
//   }
// }

// // Clock in
// export const clockIn = async (): Promise<AttendanceRecord> => {
//   try {
//     const token = getAuthToken()
//     const response = await fetch(`${API_BASE_URL}/attendances/clock-in`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//     })

//     if (!response.ok) {
//       await handleApiError(response)
//     }

//     const data: AttendanceRecord = await response.json()
//     return data
//   } catch (error) {
//     console.error('Error clocking in:', error)
//     throw error
//   }
// }

// // Clock out
// export const clockOut = async (): Promise<AttendanceRecord> => {
//   try {
//     const token = getAuthToken()
//     const response = await fetch(`${API_BASE_URL}/attendances/clock-out`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//     })

//     if (!response.ok) {
//       await handleApiError(response)
//     }

//     const data: AttendanceRecord = await response.json()
//     return data
//   } catch (error) {
//     console.error('Error clocking out:', error)
//     throw error
//   }
// }

// // Get specific attendance detail
// export const getAttendanceDetail = async (id: number): Promise<AttendanceRecord> => {
//   try {
//     const token = getAuthToken()
//     const response = await fetch(`${API_BASE_URL}/attendances/${id}`, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     })

//     if (!response.ok) {
//       await handleApiError(response)
//     }

//     const data: AttendanceRecord = await response.json()
//     return data
//   } catch (error) {
//     console.error('Error fetching attendance detail:', error)
//     throw error
//   }
// }

// // Toggle check status (approve/unapprove)
// export const toggleCheckStatus = async (id: number): Promise<AttendanceRecord> => {
//   try {
//     const token = getAuthToken()
//     const response = await fetch(`${API_BASE_URL}/attendances/${id}/check`, {
//       method: 'PATCH',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     })

//     if (!response.ok) {
//       await handleApiError(response)
//     }

//     const data: AttendanceRecord = await response.json()
//     return data
//   } catch (error) {
//     console.error('Error toggling check status:', error)
//     throw error
//   }
// }

// // Delete attendance record
// export const deleteAttendance = async (id: number): Promise<void> => {
//   try {
//     const token = getAuthToken()
//     const response = await fetch(`${API_BASE_URL}/attendances/${id}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//     })

//     if (!response.ok) {
//       await handleApiError(response)
//     }
//   } catch (error) {
//     console.error('Error deleting attendance:', error)
//     throw error
//   }
// }

// // Utility Functions

// // Format time object to string
// export const formatTime = (timeObj: ClockTime | string | null | undefined): string => {
//   if (!timeObj) return '-'
  
//   // If already a string in HH:MM format
//   if (typeof timeObj === 'string') {
//     // Check if it's an ISO string
//     if (timeObj.includes('T') || timeObj.includes('Z')) {
//       const date = new Date(timeObj)
//       return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
//     }
//     return timeObj
//   }
  
//   // If object with hour and minute
//   if (typeof timeObj === 'object' && 'hour' in timeObj && 'minute' in timeObj) {
//     return `${String(timeObj.hour).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}`
//   }
  
//   return '-'
// }

// // Format date to readable string
// export const formatDate = (dateString: string | null | undefined): string => {
//   if (!dateString) return '-'
  
//   try {
//     const date = new Date(dateString)
//     if (isNaN(date.getTime())) return '-'
    
//     return date.toLocaleDateString('en-GB', { 
//       day: '2-digit', 
//       month: 'short', 
//       year: 'numeric' 
//     })
//   } catch {
//     return '-'
//   }
// }

// // Format employee ID
// export const formatEmployeeId = (id: number): string => {
//   return `EMP${String(id).padStart(3, '0')}`
// }