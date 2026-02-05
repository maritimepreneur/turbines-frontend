// import axiosInstance from "@/lib/axios";
// import {
//   AttendanceResponse,
//   AttendanceStatusResponse,
//   ClockInOutPayload,
//   FilterParams,
// } from "@/types/attendance";

// class AttendanceService {
//   async getAttendances(params?: FilterParams): Promise<AttendanceResponse> {
//     const queryParams = new URLSearchParams();

//     if (params) {
//       Object.entries(params).forEach(([key, value]) => {
//         if (value !== undefined && value !== null && value !== "") {
//           queryParams.append(key, String(value));
//         }
//       });
//     }

//     const queryString = queryParams.toString();
//     const endpoint = `/api/attendances${queryString ? `?${queryString}` : ""}`;

//     const response = await axiosInstance.get<AttendanceResponse>(endpoint);
//     return response.data;
//   }

//   async getAttendanceStatus(): Promise<AttendanceStatusResponse> {
//     const response = await axiosInstance.get<AttendanceStatusResponse>(
//       "/api/attendances/status"
//     );
//     return response.data;
//   }

//   async clockIn(payload: ClockInOutPayload): Promise<AttendanceResponse> {
//     const response = await axiosInstance.post<AttendanceResponse>(
//       "/api/attendances/clock-in",
//       payload
//     );
//     return response.data;
//   }

//   async clockOut(payload: ClockInOutPayload): Promise<AttendanceResponse> {
//     const response = await axiosInstance.post<AttendanceResponse>(
//       "/api/attendances/clock-out",
//       payload
//     );
//     return response.data;
//   }

//   // async approveAttendance(id: number): Promise<AttendanceResponse> {
//   //   const response = await axiosInstance.post<AttendanceResponse>(
//   //     `/api/attendances/${id}/approve`
//   //   );
//   //   return response.data;
//   // }

//   // async rejectAttendance(id: number): Promise<AttendanceResponse> {
//   //   const response = await axiosInstance.post<AttendanceResponse>(
//   //     `/api/attendances/${id}/reject`
//   //   );
//   //   return response.data;
//   // }
// }

// export const attendanceService = new AttendanceService();