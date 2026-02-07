"use client"
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faCheck, faFilter, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"

type Lead = {
  number: string;
  name: string;
  projectname: string;
  total: string;
  summary: string;
  attachment: string;
  status: string;
};

const leadsData: Lead[] = [
  {
    number: "POXXXX",
    name: "Client A",
    projectname: "Project 1",
    total: "Rp. 1.xxx.xxx",
    summary: "Summary of Requirement A",
    attachment: "Attachment A",
    status: "Pending",
  },
  {
    number: "POXXXX",
    name: "Client B",
    projectname: "Project 2",
    total: "Rp. 1.xxx.xxx",
    summary: "Summary of Requirement A",
    attachment: "Attachment A",
    status: "Pending",
  },
  {
    number: "POXXXX",
    name: "Client C",
    projectname: "Project 3",
    total: "Rp. 1.xxx.xxx",
    summary: "Summary of Requirement A",
    attachment: "Attachment A",
    status: "Pending",
  },
  {
    number: "POXXXX",
    name: "Client D",
    projectname: "Project 4",
    total: "Rp. 1.xxx.xxx",
    summary: "Summary of Requirement A",
    attachment: "Attachment A",
    status: "Pending",
  },
  {
    number: "POXXXX",
    name: "Client E",
    projectname: "Project 5",
    total: "Rp. 1.xxx.xxx",
    summary: "Summary of Requirement A",
    attachment: "Attachment A",
    status: "Pending",
  },
];


const ITEMS_PER_PAGE = 5

export default function NewLeadsPage() {
  const [showFilter, setShowFilter] = useState(false)
  const [activeTab, setActiveTab] = useState("Pending")

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
  } = useTableFilters(leadsData, 5)

  const fieldOptions = [
    { label: "Name", value: "name" },
    { label: "Projectname", value: "projectname" },
    { label: "Status", value: "status" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Finance / <span className="text-slate-600">Quotation</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Quotation</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-400 mb-4">
        <nav className="flex space-x-8 px-6 pt-4">
          {["Pending", "New", "Approved", "Rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Toolbar */}
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
            placeholder="Search name or company..."
          />
        </div>

        <Link href="/finance/purchase/purchase-form">
          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition">
            + Add
          </button>
        </Link>
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

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        {/* Table */}
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">Number</th>
              <th className="text-left py-3 px-3">Client Name</th>
              <th className="text-left py-3 px-3">Project Name</th>
              <th className="text-left py-3 px-3">Total Amount</th>
              <th className="text-left py-3 px-3">Summary of Requirement</th>
              <th className="text-left py-3 px-3">Attachment</th>
              <th className="text-left py-3 px-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-400">
                  No data found
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr
                key={item.number}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="py-3 px-3">
                  <Link
                    href={`/finance/purchase/purchase-form?number=${item.number}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {item.number}
                  </Link>
                </td>
                <td className="py-3 px-3 font-medium">{item.name}</td>
                <td className="py-3 px-3">{item.projectname}</td>
                <td className="py-3 px-3">{item.total}</td>
                <td className="py-3 px-3">{item.summary}</td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => window.open('#', '_blank')}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Download PDF"
                  >
                    <FontAwesomeIcon icon={faFilePdf} size="lg" />
                  </button>
                </td>
                <td className="py-3 px-3">{item.status}</td>
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
  );
}