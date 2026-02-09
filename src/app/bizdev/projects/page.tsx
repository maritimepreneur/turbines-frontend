"use client"

import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"

type Projects = {
  id: string
  project_type: string
  payment_type: string
  name: string
  location: string
  type: string
  duration: string
  start_data: string
  end_date: string
  description: string
  contact_id: string
  partners_id: string
  lead_id: string
  contact: string
  partners: string
  lead: string
}

const ProjectsData: Projects[] = [
  {
    id: "PRJ-001",
    project_type: "Internal",
    payment_type: "Monthly",
    name: "Website Turbines",
    location: "Jakarta",
    type: "Development",
    duration: "6 Months",
    start_data: "2025-01-01",
    end_date: "2025-06-30",
    description: "Pengembangan website manajemen turbines",
    contact_id: "CNT-001",
    partners_id: "PT-001",
    lead_id: "LD-001",
    contact: "Budi Santoso",
    partners: "PT Mahakarya",
    lead: "Andi Wijaya",
  },
]

export default function ProjectsPage() {
  const [showFilter, setShowFilter] = useState(false)

  const {
    filters,
    search,
    currentPage,
    itemsPerPage,
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
    setItemsPerPage,
  } = useTableFilters(ProjectsData, 5)

  const fieldOptions = [
    { label: "Industry", value: "industry" },
    { label: "PIC", value: "pic" },
    { label: "Period", value: "period" },
    { label: "Company", value: "company" },
    { label: "Name", value: "name" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Projects</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Projects</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-sky-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
              placeholder="Search name or company..."
            />
          </div>

          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition">
            + Add
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
              <th className="text-center py-3 px-3">ID</th>
              <th className="text-center py-3 px-3">Project Name</th>
              <th className="text-center py-3 px-3">Project Type</th>
              <th className="text-center py-3 px-3">Payment</th>
              <th className="text-center py-3 px-3">Duration</th>
              <th className="py-3 px-3 text-center">Period</th>
              <th className="text-center py-3 px-3">Action</th>
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
                <td className="py-3 px-3 text-center">{item.id}</td>
                <td className="py-3 px-3 font-medium text-center">{item.name}</td>
                <td className="py-3 px-3 text-center">{item.project_type}</td>
                <td className="py-3 px-3 text-center">{item.payment_type}</td>
                <td className="py-3 px-3 text-center">{item.duration}</td>
                <td className="py-3 px-3 text-center">
                  {item.start_data} – {item.end_date}
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-4">
                    <button className="text-sky-500 hover:text-sky-700">
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
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  )
}