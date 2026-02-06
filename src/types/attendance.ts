// export interface ClockRecord {
//   status: "On Time" | "Late" | "Early";
//   latitude: number;
//   longitude: number;
//   timestamp: string;
//   desc?: string;
// }

// export interface AttendanceRecord {
//   id: number;
//   date: string;
//   clock_in: ClockRecord;
//   clock_out: ClockRecord;
//   checked: boolean;
//   employee_id: number;
//   employee_name: string;
// }

// export interface Pagination {
//   current_page: number;
//   page_size: number;
//   total_pages: number;
//   total_items: number;
// }

// export interface AttendanceResponse {
//   message: string;
//   code: number;
//   data: {
//     list: AttendanceRecord[];
//     pagination: Pagination;
//   };
// }

// export interface AttendanceStatusResponse {
//   message: string;
//   code: number;
//   data: {
//     can_clock_in: boolean;
//     can_clock_out: boolean;
//     today_attendance?: AttendanceRecord;
//   };
// }

// export interface ClockInOutPayload {
//   latitude?: number;
//   longitude?: number;
//   desc?: string;
// }

// export interface AbsentRecord {
//   id: number;
//   employee_id: string;
//   employee_name: string;
//   department: string;
//   date: string;
//   reason: string;
//   status: "Absent" | "Approved" | "Pending";
// }

// export interface SummaryRecord {
//   employee_id: string;
//   employee_name: string;
//   present_days: number;
//   late_days: number;
//   absent_days: number;
//   attendance_rate: number;
// }

// export type AttendanceTab = "recent-activity" | "summary" | "absent";

// export interface FilterParams {
//   search?: string;
//   date_from?: string;
//   date_to?: string;
//   employee_id?: string;
//   status?: string;
//   page?: number;
//   page_size?: number;
// }