"use client"

import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"

type Employee = {
  id: string
  name: string
  position: string
  department: string
  email: string
  status: string
}

const EmployeeData: Employee[] = [
  {
    id: "EMP001",
    name: "John Doe",
    position: "Software Engineer",
    department: "IT",
    email: "john.doe@company.com",
    status: "Active"
  },
  {
    id: "EMP002",
    name: "Jane Smith",
    position: "HR Manager",
    department: "HR",
    email: "jane.smith@company.com",
    status: "Active"
  },
  {
    id: "EMP003",
    name: "Mike Johnson",
    position: "Finance Analyst",
    department: "Finance",
    email: "mike.johnson@company.com",
    status: "On Leave"
  },
]

export default function HRPage() {
  const [showFilter, setShowFilter] = useState(false)

  const {
    filters,
    search,
    currentPage,
    paginatedData,
    filteredData,
    totalPages,
    addFilter,
    removeFilter,
    updateFilterField,
    updateFilterValue,
    resetFilters,
    setSearch,
    setCurrentPage,
  } = useTableFilters(EmployeeData, 5)

  const fieldOptions = [
    { label: "Department", value: "department" },
    { label: "Position", value: "position" },
    { label: "Status", value: "status" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          HR / <span className="text-slate-600">Employees</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Employees</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-purple-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
              {filters.length > 0 && (
                <span className="bg-white text-purple-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                  {filters.length}
                </span>
              )}
            </button>

            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search employee name..."
            />
          </div>

          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition">
            + Add Employee
          </button>
        </div>

        {/* Filter Panel */}
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

        {/* Table */}
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">ID</th>
              <th className="text-left py-3 px-3">Name</th>
              <th className="text-left py-3 px-3">Position</th>
              <th className="text-left py-3 px-3">Department</th>
              <th className="text-left py-3 px-3">Email</th>
              <th className="text-left py-3 px-3">Status</th>
              <th className="text-left py-3 px-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">
                  No data found
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50 transition">
                <td className="py-3 px-3">{item.id}</td>
                <td className="py-3 px-3 font-medium">{item.name}</td>
                <td className="py-3 px-3">{item.position}</td>
                <td className="py-3 px-3">{item.department}</td>
                <td className="py-3 px-3">{item.email}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-4">
                    <button className="text-purple-500 hover:text-purple-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-red-500 hover:text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}