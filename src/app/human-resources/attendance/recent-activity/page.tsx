"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { Pagination } from "@/components/table/Pagination";
import axiosInstance from "@/lib/axios";

type AttendanceRecord = {
  id: number;
  date: string;
  clock_in: {
    status: string;
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  clock_out: {
    status: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    desc?: string;
  };
  checked: boolean;
  employee_id: number;
  employee_name: string;
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

const ITEMS_PER_PAGE = 5;

const TABS = [
  {
    label: "Recent Activity",
    href: "/human-resources/attendance/recent-activity",
  },
  { label: "Summary", href: "/human-resources/attendance/summary" },
  { label: "Absent", href: "/human-resources/attendance/absent" },
];

export default function RecentActivityPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [showFilter, setShowFilter] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: ITEMS_PER_PAGE,
    total_pages: 1,
    total_items: 0,
  });

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Array<{ id: string; field: string; value: string }>
  >([]);

  const fieldOptions = [
    { label: "Employee Name", value: "employee_name" },
    { label: "Status", value: "clock_in.status" },
    { label: "Date", value: "date" },
  ];

  const fetchAttendances = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("📥 Fetching attendance data... Page:", page);

      const response = await axiosInstance.post<AttendanceResponse>(
        "/api/attendances/",
        {
          params: {
            page,
            page_size: ITEMS_PER_PAGE,
            sort_by: 'id',
          },
        }
      );

      console.log("📦 Response:", response.data);

      if (response.data.code === 200) {
        console.log(
          "✅ Attendance data fetched:",
          response.data.data.list.length,
          "items"
        );
        setAttendanceData(response.data.data.list);
        setPagination(response.data.data.pagination);
        setCurrentPage(response.data.data.pagination.current_page);
      } else {
        throw new Error(response.data.message || "Failed to fetch attendance");
      }
    } catch (err: any) {
      console.error("❌ Error fetching attendance:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        router.push("/login");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to load attendance data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances(currentPage);
  }, [currentPage]);

  const filteredAttendances = useMemo(() => {
    let filtered = [...attendanceData];

    if (search) {
      filtered = filtered.filter(
        (record) =>
          record.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
          `EMP${String(record.employee_id).padStart(3, "0")}`
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    filters.forEach((filter) => {
      if (filter.value) {
        filtered = filtered.filter((record) => {
          const fieldValue = record[filter.field as keyof AttendanceRecord];
          return (
            fieldValue &&
            String(fieldValue)
              .toLowerCase()
              .includes(filter.value.toLowerCase())
          );
        });
      }
    });

    return filtered;
  }, [attendanceData, search, filters]);

  const handleApprove = async (id: number, employeeName: string) => {
    const confirmApprove = window.confirm(
      `Are you sure you want to approve attendance for "${employeeName || 'this employee'}"?`
    );

    if (!confirmApprove) return;

    try {
      setIsProcessing(id);
      console.log("✅ Approving attendance:", id);

      // Memanggil API untuk approve (set checked = true)
      const response = await axiosInstance.patch(`/api/attendances/${id}/check`);

      if (response.data.code === 200) {
        console.log("✅ Attendance approved successfully");
        console.log("📦 Updated data:", response.data.data);

        // Update local state dengan data dari response
        setAttendanceData(prevData =>
          prevData.map(item => {
            if (item.id === id) {
              // Gunakan data dari response jika ada
              if (response.data.data) {
                return { ...item, ...response.data.data };
              } else {
                // Fallback: manual set checked = true
                return { ...item, checked: true };
              }
            }
            return item;
          })
        );

        alert("Attendance approved successfully!");
      } else {
        throw new Error(response.data.message || "Failed to approve attendance");
      }
    } catch (err: any) {
      console.error("❌ Error approving attendance:", err);

      if (err.response?.data?.message) {
        alert(`Failed to approve: ${err.response.data.message}`);
      } else {
        alert("Failed to approve attendance. Please try again.");
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (id: number, employeeName: string) => {
    const confirmReject = window.confirm(
      `Are you sure you want to reject attendance for "${employeeName || 'this employee'}"?`
    );

    if (!confirmReject) return;

    try {
      setIsProcessing(id);
      console.log("❌ Rejecting attendance:", id);

      // PERBAIKAN: Menggunakan endpoint yang sama /check
      // API akan toggle checked value (true -> false, false -> true)
      const response = await axiosInstance.patch(`/api/attendances/${id}/check`);

      if (response.data.code === 200) {
        console.log("✅ Attendance rejected successfully");
        console.log("📦 Updated data:", response.data.data);

        // Update local state dengan data dari response
        setAttendanceData(prevData =>
          prevData.map(item => {
            if (item.id === id) {
              // Gunakan data dari response jika ada
              if (response.data.data) {
                return { ...item, ...response.data.data };
              } else {
                // Fallback: manual set checked = false
                return { ...item, checked: false };
              }
            }
            return item;
          })
        );

        alert("Attendance rejected successfully!");
      } else {
        throw new Error(response.data.message || "Failed to reject attendance");
      }
    } catch (err: any) {
      console.error("❌ Error rejecting attendance:", err);

      if (err.response?.data?.message) {
        alert(`Failed to reject: ${err.response.data.message}`);
      } else {
        alert("Failed to reject attendance. Please try again.");
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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
  };

  const updateFilterValue = (id: string, value: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const resetFilters = () => {
    setFilters([]);
    setSearch("");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <p className="text-slate-600">Loading attendance data...</p>
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
              onClick={() => fetchAttendances(1)}
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mt-1 text-black">Attendance</h1>
          <div className="text-sm text-slate-500">
            Total:{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total_items}
            </span>{" "}
            records
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
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
              onChange={setSearch}
              placeholder="Search employee name or ID..."
            />
          </div>

          <button
            onClick={() => fetchAttendances(currentPage)}
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 whitespace-nowrap">
                  Employee ID
                </th>
                <th className="text-left py-3 px-3 whitespace-nowrap">
                  Employee Name
                </th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Date</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">
                  Clock In
                </th>
                <th className="text-left py-3 px-3 whitespace-nowrap">
                  Clock Out
                </th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Status</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendances.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    {search || filters.length > 0 ? (
                      <div>
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <p className="font-medium">No results found</p>
                        <p className="text-xs mt-1">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    ) : (
                      <div>
                        <svg
                          className="w-12 h-12 mx-auto mb-3 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p className="font-medium">No attendance data available</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}

              {filteredAttendances.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition ${item.checked ? "bg-gray-50" : ""
                    } ${index !== filteredAttendances.length - 1
                      ? "border-b border-slate-200"
                      : ""
                    }`}
                >
                  <td
                    className={`py-3 px-3 ${item.checked ? "text-gray-500" : ""}`}
                  >
                    EMP{String(item.employee_id).padStart(3, "0")}
                  </td>
                  <td
                    className={`py-3 px-3 font-medium ${item.checked ? "text-gray-500" : ""
                      }`}
                  >
                    <Link
                      href={`/human-resources/attendance/${item.id}`}
                      className="hover:text-sky-600 transition cursor-pointer hover:underline"
                    >
                      {item.employee_name || `Employee #${item.employee_id}`}
                    </Link>
                  </td>
                  <td
                    className={`py-3 px-3 whitespace-nowrap ${item.checked ? "text-gray-500" : ""
                      }`}
                  >
                    {formatDate(item.date)}
                  </td>
                  <td
                    className={`py-3 px-3 whitespace-nowrap ${item.checked ? "text-gray-500" : "text-sky-600 font-medium"
                      }`}
                  >
                    {formatTime(item.clock_in.timestamp)}
                    <span className="ml-2 text-xs text-gray-500">
                      ({item.clock_in.status})
                    </span>
                  </td>
                  <td
                    className={`py-3 px-3 whitespace-nowrap ${item.checked ? "text-gray-500" : "text-sky-600 font-medium"
                      }`}
                  >
                    {formatTime(item.clock_out.timestamp)}
                    <span className="ml-2 text-xs text-gray-500">
                      ({item.clock_out.status})
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {item.checked ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Approved
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.checked ? (
                      <button
                        onClick={() => handleReject(item.id, item.employee_name)}
                        disabled={isProcessing === item.id}
                        className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject"
                      >
                        {isProcessing === item.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(item.id, item.employee_name)}
                          disabled={isProcessing === item.id}
                          className="text-green-500 hover:text-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          {isProcessing === item.id ? (
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(item.id, item.employee_name)}
                          disabled={isProcessing === item.id}
                          className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          {isProcessing === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end mt-4 pt-4 border-t text-black">
          {pagination.total_pages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              totalItems={pagination.total_items}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
} 