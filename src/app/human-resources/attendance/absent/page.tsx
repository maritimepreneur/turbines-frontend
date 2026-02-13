"use client";

import { useState, useEffect, useMemo } from "react";
import { AxiosError } from "axios";
import axiosInstance from "@/lib/axios";
import { logger } from "@/lib/logger";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { Pagination } from "@/components/table/Pagination";

type AbsentEmployee = {
  id: number;
  employee_name: string;
  employee_code: string;
  nickname: string;
  img_url: string;
  phone: string;
};

interface AbsentListResponse {
  message: string;
  code: number;
  data: AbsentEmployee[];
}

const TABS = [
  {
    label: "Recent Activity",
    href: "/human-resources/attendance/recent-activity",
  },
  { label: "Summary", href: "/human-resources/attendance/summary" },
  { label: "Absent", href: "/human-resources/attendance/absent" },
];

export default function AbsentPage() {
  const pathname = usePathname();
  const [absentEmployees, setAbsentEmployees] = useState<AbsentEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchAbsentEmployees();
  }, []);

  const fetchAbsentEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.info("Fetching absent employees list");

      const response = await axiosInstance.get<AbsentListResponse>(
        "/api/attendances/absent"
      );

      if (response.data.code === 200) {
        logger.success("Absent employees fetched successfully");
        setAbsentEmployees(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch absent employees");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      logger.error("Error fetching absent employees", error);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to load absent employees. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAbsentEmployees();
  };

  // Client-side pagination
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return absentEmployees.slice(startIndex, endIndex);
  }, [absentEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(absentEmployees.length / itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newValue: number) => {
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          HR / <span className="text-slate-600">Attendance</span>
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mt-1 text-black">Attendance</h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
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

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-20 text-black">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-4" />
            <p className="text-slate-600">Loading absent employees...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-black">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
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
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600 mb-4 max-w-md">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && absentEmployees.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-16 text-black">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-green-600"
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
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              All Clear! 🎉
            </h3>
            <p className="text-slate-600 text-lg">
              No absent employees today. Everyone is present!
            </p>
          </div>
        </div>
      )}

      {/* Employee Table */}
      {!isLoading && !error && absentEmployees.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 text-black">
          <div className="mb-4 pb-4 border-b">
            <p className="text-sm text-slate-600">
              Total absent:{" "}
              <span className="font-semibold text-red-600 text-lg">
                {absentEmployees.length}
              </span>{" "}
              {absentEmployees.length === 1 ? "employee" : "employees"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    No
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Employee Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Employee Code
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Nickname
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">
                    Phone
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedEmployees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={`hover:bg-slate-50 transition ${index !== paginatedEmployees.length - 1
                      ? "border-b border-slate-200"
                      : ""
                      }`}
                  >
                    <td className="py-3 px-4 text-slate-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {employee.employee_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {employee.employee_code}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      @{employee.nickname}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {employee.phone}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          {/* Pagination */}
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={absentEmployees.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}