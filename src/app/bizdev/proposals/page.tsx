"use client"

import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { EmptyState } from "@/components/table/EmptyState"
import { ResponsiveTable } from "@/components/table/ResponsiveTable"
import { useTableFilters } from "@/hooks/useTableFilters"

type Proposals = {
  id: string
  company_name: string
  company_initial: string
  company_industrial: string
  contacts: [string]
  company_type: [string]
}

const ProposalsData: Proposals[] = [
  {
    id: "ID/001/LD/2024",
    company_name: "Pt Mahakarya",
    company_initial: "MHK",
    company_industrial: "Manufacturing",
    contacts: ["083-xxx-xxx-xxx"],
    company_type: ["Client"]
  },
  {
    id: "ID/002/LD/2024",
    company_name: "Pt Indofood",
    company_initial: "IDF",
    company_industrial: "Food & Beverage",
    contacts: ["081-xxx-xxx-xxx"],
    company_type: ["Partner"]
  },
  {
    id: "ID/003/LD/2024",
    company_name: "Pt Logistics",
    company_initial: "LOG",
    company_industrial: "Logistics",
    contacts: ["082-xxx-xxx-xxx"],
    company_type: ["Vendor"]
  },
]

export default function NewLeadsPage() {
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
  } = useTableFilters(ProposalsData, 5)

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
          Bizdev / <span className="text-slate-600">Proposals</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Proposals</h1>
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
              placeholder="Search name or company..."
            />
          </div>

          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition w-full sm:w-auto">
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
        <div className="mt-4">
          <ResponsiveTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Company Name', accessor: 'company_name', isPrimary: true, cellClassName: 'font-medium' },
              { header: 'Initial', accessor: 'company_initial' },
              { header: 'Industry', accessor: 'company_industrial' },
              { header: 'Contact', render: (item: any) => item.contacts.join(', ') },
              { header: 'Type', render: (item: any) => item.company_type.join(', ') },
              {
                header: 'Action',
                render: () => (
                  <div className="flex gap-4">
                    <button className="text-sky-500 hover:text-sky-700" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-red-500 hover:text-red-700" title="Delete">
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
            emptyState={search || filters.length > 0 ? <EmptyState type="search" /> : <EmptyState title="No data found" />}
          />
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>
    </div>
  )
}