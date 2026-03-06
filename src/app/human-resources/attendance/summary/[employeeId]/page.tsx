"use client";

import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import { SearchBar } from "@/components/table/SearchBar";
import { Pagination } from "@/components/table/Pagination";
import { ResponsiveTable, TableColumn } from "@/components/table/ResponsiveTable";
import { EmptyState } from "@/components/table/EmptyState";
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
    employee_code: string;
};

interface EmployeeHistoryResponse {
    message: string;
    code: number;
    data: AttendanceRecord[] | {
        list: AttendanceRecord[];
        pagination?: {
            current_page: number;
            page_size: number;
            total_pages: number;
            total_items: number;
        };
    };
}

const TABS = [
    {
        label: "Recent Activity",
        href: "/human-resources/attendance/recent-activity",
    },
    { label: "Summary", href: "/human-resources/attendance/summary" },
    { label: "Absent", href: "/human-resources/attendance/absent" },
];

export default function EmployeeHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const employeeId = params?.employeeId as string;

    const [historyData, setHistoryData] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [employeeName, setEmployeeName] = useState<string>("");
    const [employeeCode, setEmployeeCode] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [search, setSearch] = useState("");

    const fetchEmployeeHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axiosInstance.get<EmployeeHistoryResponse>(
                `/api/attendances/employee/${employeeId}`
            );

            if (response.data.code === 200) {
                // Handle both response shapes:
                // Shape 1: data is array directly → response.data.data = [...]
                // Shape 2: data has list property → response.data.data = { list: [...] }
                const responseData = response.data.data;
                const records = Array.isArray(responseData)
                    ? responseData
                    : responseData?.list || [];

                setHistoryData(records);
                if (records.length > 0) {
                    setEmployeeName(records[0].employee_name);
                    setEmployeeCode(records[0].employee_code || `EMP-${String(records[0].employee_id).padStart(4, "0")}`);
                }
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch employee history"
                );
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;

            if (error.response?.status === 401) {
                setError("Session expired. Please login again.");
                router.push("/login");
            } else if (error.response?.status === 404) {
                setError("Employee attendance history not found.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Failed to load employee history. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) {
            fetchEmployeeHistory();
        }
    }, [employeeId]);

    const filteredHistory = useMemo(() => {
        let filtered = [...historyData];

        if (search) {
            filtered = filtered.filter(
                (record) =>
                    record.date?.toLowerCase().includes(search.toLowerCase()) ||
                    record.clock_in?.status
                        ?.toLowerCase()
                        .includes(search.toLowerCase()) ||
                    record.clock_out?.status
                        ?.toLowerCase()
                        .includes(search.toLowerCase()) ||
                    formatDate(record.date)
                        .toLowerCase()
                        .includes(search.toLowerCase())
            );
        }

        return filtered;
    }, [historyData, search]);

    // Client-side pagination
    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredHistory.slice(startIndex, endIndex);
    }, [filteredHistory, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

    const formatTime = (timestamp: string) => {
        if (!timestamp) return "-";

        let dateStr = timestamp;
        if (
            typeof dateStr === "string" &&
            dateStr.includes("T") &&
            !dateStr.endsWith("Z") &&
            !/[+-]\d{2}:?\d{2}/.test(dateStr)
        ) {
            dateStr += "Z";
        }

        const date = new Date(dateStr);
        return date
            .toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZone: "Asia/Jakarta",
            })
            .replace(/\./g, ":");
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "Asia/Jakarta",
        });
    };

    const getClockInStatus = (timestamp: string) => {
        if (!timestamp) return { text: "-", isLate: false };

        let dateStr = timestamp;
        if (
            typeof dateStr === "string" &&
            dateStr.includes("T") &&
            !dateStr.endsWith("Z") &&
            !/[+-]\d{2}:?\d{2}/.test(dateStr)
        ) {
            dateStr += "Z";
        }
        const date = new Date(dateStr);

        const jakartaOptions = {
            timeZone: "Asia/Jakarta",
            hour: "numeric",
            hour12: false,
        } as const;
        const jakartaHour = parseInt(
            date.toLocaleTimeString("en-US", jakartaOptions)
        );
        const jakartaMinute = parseInt(
            date.toLocaleTimeString("en-US", { timeZone: "Asia/Jakarta", minute: "numeric" })
        );

        // On Time: ≤ 09:15, Late: > 09:15
        const isLate = jakartaHour > 9 || (jakartaHour === 9 && jakartaMinute > 15);
        return { text: isLate ? "Late" : "On Time", isLate };
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleItemsPerPageChange = (newValue: number) => {
        setItemsPerPage(newValue);
        setCurrentPage(1);
    };

    if (isLoading && historyData.length === 0) {
        return (
            <div>
                <div className="mb-6">
                    <p className="text-sm text-slate-400">
                        <Link
                            href="/human-resources/attendance/summary"
                            className="hover:text-slate-600"
                        >
                            HR / Attendance / Summary
                        </Link>
                        {" / "}
                        <span className="text-slate-600">History</span>
                    </p>
                    <h1 className="text-2xl font-semibold mt-1 text-black">
                        Employee Attendance History
                    </h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-600">Loading attendance history...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && historyData.length === 0) {
        return (
            <div>
                <div className="mb-6">
                    <p className="text-sm text-slate-400">
                        <Link
                            href="/human-resources/attendance/summary"
                            className="hover:text-slate-600"
                        >
                            HR / Attendance / Summary
                        </Link>
                        {" / "}
                        <span className="text-slate-600">History</span>
                    </p>
                    <h1 className="text-2xl font-semibold mt-1 text-black">
                        Employee Attendance History
                    </h1>
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
                        <div className="flex gap-3">
                            <button
                                onClick={() => fetchEmployeeHistory()}
                                className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition"
                            >
                                Try Again
                            </button>
                            <Link
                                href="/human-resources/attendance/summary"
                                className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-200 transition"
                            >
                                Back to Summary
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <p className="text-sm text-slate-400">
                    <Link
                        href="/human-resources/attendance/summary"
                        className="hover:text-slate-600 transition"
                    >
                        HR / Attendance / Summary
                    </Link>
                    {" / "}
                    <span className="text-slate-600">History</span>
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                        <h1 className="text-2xl font-semibold mt-1 text-black">
                            Attendance History
                        </h1>
                        {employeeName && (
                            <p className="text-sm text-slate-500 mt-1">
                                <span className="font-medium text-slate-700">
                                    {employeeName}
                                </span>{" "}
                                — {employeeCode}
                            </p>
                        )}
                    </div>
                    <Link
                        href="/human-resources/attendance/summary"
                        className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1 w-fit"
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
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Summary
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mb-6 border-b">
                {TABS.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`pb-3 px-1 text-sm font-medium transition ${pathname?.startsWith(tab.href)
                            ? "text-sky-600 border-b-2 border-sky-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Summary Stats */}
            {historyData.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-sky-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Records</p>
                                <p className="text-xl font-bold text-slate-800">
                                    {historyData.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-green-600"
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
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">On Time</p>
                                <p className="text-xl font-bold text-green-600">
                                    {
                                        historyData.filter(
                                            (r) =>
                                                !getClockInStatus(r.clock_in?.timestamp).isLate
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Late</p>
                                <p className="text-xl font-bold text-red-600">
                                    {
                                        historyData.filter(
                                            (r) =>
                                                getClockInStatus(r.clock_in?.timestamp).isLate
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-emerald-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Approved</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {historyData.filter((r) => r.checked).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm p-6 text-black">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search by date..."
                        />
                    </div>

                    <button
                        onClick={() => fetchEmployeeHistory()}
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

                <div className="mt-4">
                    <ResponsiveTable<AttendanceRecord>
                        columns={[
                            {
                                header: 'No',
                                render: (item, index) => {
                                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                    return <span className={item.checked ? "text-gray-500" : ""}>{rowNumber}</span>;
                                }
                            },
                            {
                                header: 'Date',
                                render: (item) => <span className={`whitespace-nowrap ${item.checked ? "text-gray-500" : ""}`}>{formatDate(item.date)}</span>,
                            },
                            {
                                header: 'Clock In',
                                render: (item) => <span className={`whitespace-nowrap ${item.checked ? "text-gray-500" : "text-sky-600 font-medium"}`}>{formatTime(item.clock_in?.timestamp)}</span>,
                            },
                            {
                                header: 'Clock Out',
                                render: (item) => <span className={`whitespace-nowrap ${item.checked ? "text-gray-500" : "text-orange-600 font-medium"}`}>{formatTime(item.clock_out?.timestamp)}</span>,
                            },
                            {
                                header: 'Clock In Status',
                                render: (item) => {
                                    const clockInStatus = getClockInStatus(item.clock_in?.timestamp);
                                    return item.clock_in?.timestamp ? (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${clockInStatus.isLate ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                            {clockInStatus.text}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    );
                                }
                            },
                            {
                                header: 'Approval',
                                render: (item) => item.checked ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>
                                ) : (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
                                ),
                            },
                            {
                                header: 'Action',
                                render: (item) => (
                                    <Link
                                        href={`/human-resources/attendance/summary/${employeeId}/${item.id}?name=${encodeURIComponent(employeeName || "Employee #" + employeeId)}`}
                                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 text-xs font-medium transition hover:underline"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Detail
                                    </Link>
                                ),
                            }
                        ]}
                        data={paginatedHistory}
                        keyAccessor={(item) => item.id}
                        rowClassName={(item) => item.checked ? "bg-gray-50" : ""}
                        emptyState={
                            search ? <EmptyState type="search" /> : <EmptyState title="No attendance history found" />
                        }
                    />
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredHistory.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                )}
            </div>
        </div >
    );
}
