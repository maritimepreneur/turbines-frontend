"use client"

import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { ResponsiveTable } from "@/components/table/ResponsiveTable"
import { useTableFilters } from "@/hooks/useTableFilters"
import { useVendors, useDeleteVendor } from "@/hooks/useVendors"

export default function VendorListPage() {
  const [showFilter, setShowFilter] = useState(false)
  const { data: response, isLoading } = useVendors()
  const deleteVendor = useDeleteVendor()

  // useVendors tanpa params → ambil semua data, filtering di frontend
  const vendors = response?.data ?? []

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
  } = useTableFilters(vendors, 10)

  const handleDelete = (id: number) => {
    if (confirm("Hapus vendor ini?")) {
      deleteVendor.mutate(id)
    }
  }

  const fieldOptions = [
    { label: "Company Name", value: "name" },
    { label: "Initials", value: "initials" },
    { label: "Industry", value: "industry" },
    { label: "Company Type", value: "company_type" },
    { label: "Partner Type", value: "partner_type" },
  ]

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Vendor List</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Vendor List</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
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
            onClick={() => (window.location.href = "/bizdev/vendor-list/add")}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition w-full sm:w-auto"
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
        <ResponsiveTable
          columns={[
            {
              header: 'ID',
              accessor: 'id',
              cellClassName: 'text-slate-400',
            },
            {
              header: 'Company Name',
              accessor: 'name',
              isPrimary: true,
              cellClassName: 'font-medium',
            },
            {
              header: 'Initial',
              accessor: 'initials',
            },
            {
              header: 'Industry',
              accessor: 'industry',
            },
            {
              header: 'Company Type',
              render: (item: any) => (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {item.company_type}
                </span>
              ),
            },
            {
              header: 'Partner Type',
              render: (item: any) => (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-600">
                  {item.partner_type}
                </span>
              ),
            },
            {
              header: 'Action',
              render: (item: any) => (
                <div className="flex gap-4">
                  <button
                    className="text-sky-500 hover:text-sky-700"
                    onClick={(e) => { e.stopPropagation(); window.location.href = `/bizdev/vendor-list/edit?id=${item.id}` }}
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }}
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ),
            },
          ]}
          data={paginatedData}
          keyAccessor={(item: any) => item.id}
          emptyState="No vendors found"
        />

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
