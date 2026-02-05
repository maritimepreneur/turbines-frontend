// import { useState, useEffect, useCallback } from "react";
// import { attendanceService } from "@/services/attendanceService";
// import {
//   AttendanceRecord,
//   FilterParams,
//   Pagination,
// } from "@/types/attendance";

// interface UseAttendanceReturn {
//   attendances: AttendanceRecord[];
//   pagination: Pagination | null;
//   loading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
//   setFilters: (filters: FilterParams) => void;
// }

// export function useAttendance(
//   initialFilters?: FilterParams
// ): UseAttendanceReturn {
//   const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
//   const [pagination, setPagination] = useState<Pagination | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [filters, setFilters] = useState<FilterParams>(
//     initialFilters || { page: 1, page_size: 25 }
//   );

//   const fetchAttendances = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await attendanceService.getAttendances(filters);

//       setAttendances(response.data.list);
//       setPagination(response.data.pagination);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch data");
//       setAttendances([]);
//       setPagination(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters]);

//   useEffect(() => {
//     fetchAttendances();
//   }, [fetchAttendances]);

//   return {
//     attendances,
//     pagination,
//     loading,
//     error,
//     refetch: fetchAttendances,
//     setFilters,
//   };
// }