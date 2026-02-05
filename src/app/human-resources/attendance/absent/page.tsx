"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { Pagination } from "@/components/table/Pagination";

type AbsentRecord = {
  id: number;
  employee_id: string;
  employee_name: string;
  department: string;
  date: string;
  reason: string;
  status: "Absent" | "Approved" | "Pending";
};

const ITEMS_PER_PAGE = 25;

const TABS = [
  {
    label: "Recent Activity",
    href: "/human-resources/attendance/recent-activity",
  },
  { label: "Summary", href: "/human-resources/attendance/summary" },
  { label: "Absent", href: "/human-resources/attendance/absent" },
];

// Mock data - Replace with actual API call when available
const MOCK_ABSENT_DATA: AbsentRecord[] = [
  {
    id: 1,
    employee_id: "EMP003",
    employee_name: "Mike Johnson",
    department: "Finance",
    date: "01 Dec 2025",
    reason: "Sick Leave",
    status: "Absent",
  },
  {
    id: 2,
    employee_id: "EMP005",
    employee_name: "Sarah Wilson",
    department: "HR",
    date: "30 Nov 2025",
    reason: "Personal Leave",
    status: "Absent",
  },
  {
    id: 3,
    employee_id: "EMP007",
    employee_name: "David Chen",
    department: "IT",
    date: "29 Nov 2025",
    reason: "Medical Appointment",
    status: "Absent",
  },
  {
    id: 4,
    employee_id: "EMP009",
    employee_name: "Emily Brown",
    department: "Marketing",
    date: "28 Nov 2025",
    reason: "Family Emergency",
    status: "Absent",
  },
];

export default function AbsentPage() {
  const pathname = usePathname();
  const [showFilter, setShowFilter] = useState(false);
  const [isLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Array<{ id: string; field: string; value: string }>
  >([]);

  const fieldOptions = [
    { label: "Department", value: "department" },
    { label: "Reason", value: "reason" },
    { label: "Status", value: "status" },
  ];

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = [...MOCK_ABSENT_DATA];

    if (search) {
      filtered = filtered.filter(
        (record) =>
          record.employee_name.toLowerCase().includes(search.toLowerCase()) ||
          record.employee_id.toLowerCase().includes(search.toLowerCase()) ||
          record.department.toLowerCase().includes(search.toLowerCase())
      );
    }

    filters.forEach((filter) => {
      if (filter.value) {
        filtered = filtered.filter((record) => {
          const fieldValue = record[filter.field as keyof AbsentRecord];
          return (
            fieldValue &&
            String(fieldValue).toLowerCase().includes(filter.value.toLowerCase())
          );
        });
      }
    });

    return filtered;
  }, [search, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const pagination = {
    current_page: currentPage,
    page_size: ITEMS_PER_PAGE,
    total_pages: Math.ceil(filteredData.length / ITEMS_PER_PAGE),
    total_items: filteredData.length,
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
              {filteredData.length}
            </span>{" "}
            absent records
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 px-1 text-sm font-medium transition ${
              pathname === tab.href
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
              placeholder="Search employee name, ID, or department..."
            />
          </div>

          <button
            onClick={() => window.location.reload()}
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
                <th className="text-left py-3 px-3 whitespace-nowrap">
                  Department
                </th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Date</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Reason</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
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
                        <p className="font-medium">No absent records found</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}

              {paginatedData.map((record, index) => (
                <tr
                  key={record.id}
                  className={`hover:bg-slate-50 transition ${
                    index !== paginatedData.length - 1
                      ? "border-b border-slate-200"
                      : ""
                  }`}
                >
                  <td className="py-3 px-3">{record.employee_id}</td>
                  <td className="py-3 px-3 font-medium">
                    {record.employee_name}
                  </td>
                  <td className="py-3 px-3 text-xs">{record.department}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{record.date}</td>
                  <td className="py-3 px-3">{record.reason}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end mt-4 pt-4 border-t text-black">
          {pagination.total_pages > 1 && (
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