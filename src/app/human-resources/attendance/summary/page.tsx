"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { Pagination } from "@/components/table/Pagination";
import { ResponsiveTable } from "@/components/table/ResponsiveTable";
import { EmptyState } from "@/components/table/EmptyState";
import axiosInstance from "@/lib/axios";

type AttendanceRecord = {
  id: number;
  date: string;
  clock_in: {
    status: string;
    timestamp: string;
  };
  clock_out: {
    status: string;
    timestamp: string;
  };
  checked: boolean;
  employee_id: number;
  employee_name: string;
  employee_code: string;
};

interface AttendanceResponse {
  message: string;
  code: number;
  data: {
    list: AttendanceRecord[];
    pagination: {
      current_page: number;
      page_size: number;
      total_pages: number;
      total_items: number;
    };
  };
}

interface EmployeeSummary {
  employee_id: string;
  raw_employee_id: number;
  employee_name: string;
  present_days: number;
  late_days: number;
  absent_days: number;
  attendance_rate: number;
}



const TABS = [
  {
    label: "Recent Activity",
    href: "/human-resources/attendance/recent-activity",
  },
  { label: "Summary", href: "/human-resources/attendance/summary" },
  { label: "Absent", href: "/human-resources/attendance/absent" },
];

export default function SummaryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [showFilter, setShowFilter] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Mapping employee_id → employee_code dari /api/employees/
  const [employeeCodeMap, setEmployeeCodeMap] = useState<Record<number, string>>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 5,
    total_pages: 1,
    total_items: 0,
  });

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Array<{ id: string; field: string; value: string }>
  >([]);

  const fieldOptions = [
    { label: "Employee Name", value: "employee_name" },
    { label: "Attendance Rate", value: "attendance_rate" },
  ];

  const fetchAttendances = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📥 Fetching all attendance summary...");

      const response = await axiosInstance.post<AttendanceResponse>(
        "/api/attendances/",
        {
          page: 1,
          page_size: 150,
          sort_by: 'id',
          sort_order: 'DESC',
        }
      );

      console.log("📦 Response:", response.data);

      if (response.data.code === 200) {
        console.log(
          "✅ Summary data fetched:",
          response.data.data.list.length,
          "items"
        );
        setAttendanceData(response.data.data.list);
        setPagination(response.data.data.pagination);
      } else {
        throw new Error(response.data.message || "Failed to fetch summary");
      }
    } catch (err: any) {
      console.error("❌ Error fetching summary:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        router.push("/login");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load summary data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
    // Fetch employee list untuk mapping employee_id → employee_code
    axiosInstance.get('/api/employees/')
      .then((res) => {
        const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        const map: Record<number, string> = {};
        list.forEach((emp) => {
          if (emp.id && emp.employee_code) {
            map[emp.id] = emp.employee_code;
          }
        });
        setEmployeeCodeMap(map);
      })
      .catch(() => {
        // Jika gagal, biarkan kosong — fallback ke format EMP-XXXX
      });
  }, []);

  // Calculate summary from attendance data
  const summaryData = useMemo((): EmployeeSummary[] => {
    const employeeMap = new Map<number, EmployeeSummary>();

    attendanceData.forEach((record: AttendanceRecord) => {
      const key = record.employee_id;
      if (!employeeMap.has(key)) {
        employeeMap.set(key, {
          employee_id: employeeCodeMap[record.employee_id] || `EMP-${String(record.employee_id).padStart(4, "0")}`,
          raw_employee_id: record.employee_id,
          employee_name: record.employee_name,
          present_days: 0,
          late_days: 0,
          absent_days: 0,
          attendance_rate: 0,
        });
      }

      const summary = employeeMap.get(key)!;

      // Count present days
      if (record.clock_in && record.clock_out) {
        summary.present_days++;

        // Count late days
        if (
          record.clock_in.status === "Late" ||
          record.clock_out.status === "Late"
        ) {
          summary.late_days++;
        }
      }
    });

    // Calculate attendance rate
    employeeMap.forEach((summary) => {
      const totalDays =
        summary.present_days + summary.late_days + summary.absent_days;
      summary.attendance_rate =
        totalDays > 0 ? Math.round((summary.present_days / totalDays) * 100) : 0;
    });

    return Array.from(employeeMap.values());
  }, [attendanceData, employeeCodeMap]);

  const filteredSummary = useMemo(() => {
    let filtered = [...summaryData];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (summary) =>
          summary.employee_name?.toLowerCase().includes(q) ||
          summary.employee_id?.toLowerCase().includes(q)
      );
    }

    filters.forEach((filter) => {
      if (filter.value) {
        filtered = filtered.filter((summary) => {
          const fieldValue = summary[filter.field as keyof EmployeeSummary];
          return (
            fieldValue !== undefined &&
            String(fieldValue)
              .toLowerCase()
              .includes(filter.value.toLowerCase())
          );
        });
      }
    });

    return filtered;
  }, [summaryData, search, filters]);

  // Client-side pagination
  const paginatedSummary = useMemo(() => {
    if (itemsPerPage >= 99999) return filteredSummary; // All
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSummary.slice(startIndex, endIndex);
  }, [filteredSummary, currentPage, itemsPerPage]);

  const totalPages = filteredSummary.length === 0
    ? 0
    : Math.max(1, Math.ceil(filteredSummary.length / (itemsPerPage >= 99999 ? filteredSummary.length : itemsPerPage)));

  const addFilter = () => {
    const newFilter = {
      id: Date.now().toString(),
      field: fieldOptions[0].value,
      value: "",
    };
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilterField = (id: string, field: string) => {
    setFilters(
      filters.map((f) => (f.id === id ? { ...f, field, value: "" } : f))
    );
    setCurrentPage(1);
  };

  const updateFilterValue = (id: string, value: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, value } : f)));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters([]);
    setSearch("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newValue: number) => {
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return "bg-green-100 text-green-800";
    if (rate >= 75) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (isLoading && attendanceData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            HR / <span className="text-slate-600">Attendance</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Attendance</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading summary data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && attendanceData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            HR / <span className="text-slate-600">Attendance</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Attendance</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Failed to Load Data
            </h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => fetchAttendances()}
              className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          HR / <span className="text-slate-600">Attendance</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-2xl font-semibold mt-1 text-black">Attendance</h1>
          <div className="text-sm text-slate-500">
            Total:{" "}
            <span className="font-semibold text-slate-700">
              {summaryData.length}
            </span>{" "}
            employees
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 px-1 text-sm font-medium transition ${pathname === tab.href
              ? "text-sky-600 border-b-2 border-sky-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-sky-600 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter
              {filters.length > 0 && (
                <span className="bg-white text-sky-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                  {filters.length}
                </span>
              )}
            </button>

            <SearchBar
              value={search}
              onChange={(val) => { setSearch(val); setCurrentPage(1); }}
              placeholder="Search employee name or ID..."
            />
          </div>

          <button
            onClick={() => fetchAttendances()}
            disabled={isLoading}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
            title="Refresh data"
          >
            <svg
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        <FilterPanel
          show={showFilter}
          filters={filters}
          onAddFilter={addFilter}
          onRemoveFilter={removeFilter}
          onUpdateField={updateFilterField}
          onUpdateValue={updateFilterValue}
          onResetAll={resetFilters}
          fieldOptions={fieldOptions}
        />

        <div className="mt-4">
          <ResponsiveTable<EmployeeSummary>
            columns={[
              {
                header: 'Employee Code',
                accessor: 'employee_id',
              },
              {
                header: 'Employee Name',
                isPrimary: true,
                render: (summary) => (
                  <Link
                    href={`/human-resources/attendance/summary/${summary.raw_employee_id}`}
                    className="font-medium hover:text-sky-600 transition cursor-pointer hover:underline"
                  >
                    {summary.employee_name}
                  </Link>
                ),
              },
              {
                header: 'Present Days',
                render: (summary) => (
                  <span className="font-medium">{summary.present_days}</span>
                ),
              },
              {
                header: 'Late Days',
                render: (summary) => (
                  <span className="font-medium">{summary.late_days}</span>
                ),
              },
              {
                header: 'Absent Days',
                render: (summary) => (
                  <span className="font-medium">{summary.absent_days}</span>
                ),
              },
              {
                header: 'Attendance Rate',
                render: (summary) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAttendanceRateColor(summary.attendance_rate)}`}>
                    {summary.attendance_rate}%
                  </span>
                ),
              },
            ]}
            data={paginatedSummary}
            keyAccessor={(summary) => summary.employee_id}
            showTopBorder={false}
            emptyState={
               search || filters.length > 0
                ? <EmptyState type="search" />
                : <EmptyState title="No summary data available" />
            }
          />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSummary.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  );
}