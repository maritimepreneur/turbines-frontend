"use client"

import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"

type Approvals = {
  approval_type:string
  id: string
  code: string
  quotation_id: string
  po_id:string
  invoice_id:string
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
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
         <div className="flex gap-2 mb-6 overflow-x-auto">
          {stages.map((stage) => (
            <button
              key={stage}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                stage === 'New Request'
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
              <th className="text-left py-3 px-3">Approval Type</th>
              <th className="text-left py-3 px-3">ID</th>
              <th className="text-left py-3 px-3">Code</th>
              <th className="text-left py-3 px-3">Quotation id</th>
              <th className="text-left py-3 px-3">PO id</th>
              <th className="text-left py-3 px-3">Invoice id</th>
              <th className="text-left py-3 px-3">Expense id</th>
              <th className="text-left py-3 px-3">Leads id</th>
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
                <td className="py-3 px-3">{item.approval_type}</td>
                <td className="py-3 px-3 font-medium">{item.id}</td>
                <td className="py-3 px-3">{item.code}</td>
                <td className="py-3 px-3">{item.quotation_id}</td>
                <td className="py-3 px-3">{item.po_id}</td>
                <td className="py-3 px-3">{item.invoice_id}</td>
                <td className="py-3 px-3">{item.expense_id}</td>
                <td className="py-3 px-3">{item.leads_id}</td>
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
          itemsPerPage={5}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}