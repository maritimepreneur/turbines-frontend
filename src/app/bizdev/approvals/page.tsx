"use client"

import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { EmptyState } from "@/components/table/EmptyState"
import { ResponsiveTable } from "@/components/table/ResponsiveTable"
import { useTableFilters } from "@/hooks/useTableFilters"

type Approvals = {
  approval_type: string
  id: string
  code: string
  quotation_id: string
  po_id: string
  invoice_id: string
  expense_id: string
  leads_id: string
}

const ApprovalsData: Approvals[] = [
  {
    approval_type: "Quotation",
    id: "ID/001/LD/2024",
    quotation_id: "Pt Mahakarya",
    code: "fdamda",
    po_id: "MHK",
    invoice_id: "Manufacturing",
    expense_id: "083-xxx-xxx-xxx",
    leads_id: "Client",
  },
  {
    approval_type: "Purchase Order",
    id: "ID/002/PO/2024",
    quotation_id: "Pt Sinar Abadi",
    code: "po-7821",
    po_id: "SNA",
    invoice_id: "Trading",
    expense_id: "081-xxx-xxx-222",
    leads_id: "Vendor",
  },
  {
    approval_type: "Invoice",
    id: "ID/003/INV/2024",
    quotation_id: "Pt Global Teknologi",
    code: "inv-3321",
    po_id: "GLT",
    invoice_id: "Technology",
    expense_id: "082-xxx-xxx-333",
    leads_id: "Partner",
  },
  {
    approval_type: "Expense",
    id: "ID/004/EXP/2024",
    quotation_id: "Pt Nusantara Jaya",
    code: "exp-9912",
    po_id: "NSJ",
    invoice_id: "Services",
    expense_id: "085-xxx-xxx-444",
    leads_id: "Internal",
  },
  {
    approval_type: "Quotation",
    id: "ID/005/LD/2024",
    quotation_id: "Pt Artha Mandiri",
    code: "quo-5544",
    po_id: "ARM",
    invoice_id: "Finance",
    expense_id: "087-xxx-xxx-555",
    leads_id: "Client",
  },
]


export default function AprovalsPage() {
  const [showFilter, setShowFilter] = useState(false)
  const stages = ['New Request', 'Approved', 'Rejected'];

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
  } = useTableFilters(ApprovalsData, 5)

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
          Bizdev / <span className="text-slate-600">Approvals</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Approvals</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {stages.map((stage) => (
            <button
              key={stage}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${stage === 'New Request'
                ? 'text-white'
                : 'bg-gray-100 text-gray-600'
                }`}
              style={stage === 'New Request' ? { backgroundColor: '#00A6FB' } : {}}
            >
              {stage}
            </button>
          ))}
        </div>

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
        <ResponsiveTable
          columns={[
            { header: 'Approval Type', accessor: 'approval_type', isPrimary: true },
            { header: 'ID', accessor: 'id', cellClassName: 'font-medium' },
            { header: 'Code', accessor: 'code' },
            { header: 'Quotation ID', accessor: 'quotation_id' },
            { header: 'PO ID', accessor: 'po_id' },
            { header: 'Invoice ID', accessor: 'invoice_id' },
            { header: 'Expense ID', accessor: 'expense_id' },
            { header: 'Leads ID', accessor: 'leads_id' },
            {
              header: 'Action',
              render: () => (
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
              ),
            },
          ]}
          data={paginatedData}
          keyAccessor={(item: any) => item.id}
          emptyState={search ? <EmptyState type="search" /> : <EmptyState title="No data found" />}
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