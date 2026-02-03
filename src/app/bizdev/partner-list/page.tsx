"use client"

import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"
import { usePartners, useDeletePartner } from "@/hooks/usePartners"

export default function NewLeadsPage() {
  const [showFilter, setShowFilter] = useState(false)
  const { data: partners = [], isLoading } = usePartners()
  const deletePartner = useDeletePartner()

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
  } = useTableFilters(partners, 5)

  const handleDelete = (id: number) => {
    if (confirm('Hapus partner ini?')) {
      deletePartner.mutate(id)
    }
  }

  const fieldOptions = [
    { label: "Company Name", value: "name" },
    { label: "Initials", value: "initials" },
    { label: "Industry", value: "industry" },
    { label: "Company Type", value: "company_type" },
    { label: "Partner Type", value: "partner_type" },
    { label: "Service", value: "service" },
  ]

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Partner List</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Partner List</h1>
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
              placeholder="Search company name or initials..."
            />
          </div>

          <button 
            onClick={() => window.location.href = '/bizdev/partner-list/add'}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition"
          >
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
              <th className="text-left py-3 px-3">ID</th>
              <th className="text-left py-3 px-3">Company Name</th>
              <th className="text-left py-3 px-3">Initial</th>
              <th className="text-left py-3 px-3">Industry</th>
              <th className="text-left py-3 px-3">Service</th>
              <th className="text-left py-3 px-3">Company Type</th>
              <th className="text-left py-3 px-3">Partner Type</th>
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
                <td className="py-3 px-3">{item.initials}</td>
                <td className="py-3 px-3">{item.industry}</td>
                <td className="py-3 px-3">{item.service || '-'}</td>
                <td className="py-3 px-3">{item.company_type}</td>
                <td className="py-3 px-3">{item.partner_type}</td>
                <td className="py-3 px-3">
                  <div className="flex gap-4">
                    <button 
                      className="text-sky-500 hover:text-sky-700"
                      onClick={() => window.location.href = `/bizdev/partner-list/edit?id=${item.id}`}
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >
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