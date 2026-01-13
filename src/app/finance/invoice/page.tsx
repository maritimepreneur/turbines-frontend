"use client"

import SearchInput from "@/components/table/SearchInput"
import FilterSelect from "@/components/table/FilterSelect"
import Pagination from "@/components/table/Pagination"
import { useState, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faFilter,
  faPencil,
  faTrash,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons"

type Lead = {
  id: string
  name: string
  pic: string
  company: string
  period: string
  industry: string
  lastUpdate: string
}

const leadsData: Lead[] = [
  {
    id: "ID/001/LD/2024",
    name: "John Doe",
    pic: "Alice",
    company: "Lorem Corp",
    period: "Aug 2025",
    industry: "Tech Services",
    lastUpdate: "24-05-2024",
  },
  {
    id: "ID/002/LD/2024",
    name: "Jane Smith",
    pic: "Bob",
    company: "Ipsum Solutions",
    period: "Sep 2025",
    industry: "Logistics",
    lastUpdate: "23-05-2024",
  },
  {
    id: "ID/003/LD/2024",
    name: "Michael Brown",
    pic: "Charlie",
    company: "Global Trade Inc",
    period: "Oct 2025",
    industry: "Finance",
    lastUpdate: "22-05-2024",
  },
  {
    id: "ID/004/LD/2024",
    name: "Emily Davis",
    pic: "Diana",
    company: "Tech Solutions",
    period: "Nov 2025",
    industry: "Tech Services",
    lastUpdate: "21-05-2024",
  },
  {
    id: "ID/005/LD/2024",
    name: "William Johnson",
    pic: "Eve",
    company: "LogiCorp",
    period: "Dec 2025",
    industry: "Logistics",
    lastUpdate: "20-05-2024",
  },
  {
    id: "ID/006/LD/2024",
    name: "Olivia Wilson",
    pic: "Frank",
    company: "FinServe Ltd",
    period: "Jan 2026",
    industry: "Finance",
    lastUpdate: "19-05-2024",
  },
  {
    id: "ID/007/LD/2024",
    name: "James Taylor",
    pic: "Grace",
    company: "Innovatech",
    period: "Feb 2026",
    industry: "Tech Services",
    lastUpdate: "18-05-2024",
  },
  {
    id: "ID/008/LD/2024",
    name: "Sophia Martinez",
    pic: "Hank",
    company: "LogisticsPro",
    period: "Mar 2026",
    industry: "Logistics",
    lastUpdate: "17-05-2024",
  },
  {
    id: "ID/009/LD/2024",
    name: "Benjamin Lee",
    pic: "Ivy",
    company: "FinanceHub",
    period: "Apr 2026",
    industry: "Finance",
    lastUpdate: "16-05-2024",
  },
  {
    id: "ID/010/LD/2024",
    name: "Ava Anderson",
    pic: "Jack",
    company: "TechWorks",
    period: "May 2026",
    industry: "Tech Services",
    lastUpdate: "15-05-2024",
  },
]


const ITEMS_PER_PAGE = 5

export default function NewLeadsPage() {
  const [showFilter, setShowFilter] = useState(false)
  const [industryFilter, setIndustryFilter] = useState("")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // 🔎 FILTER + SEARCH
  const filteredData = useMemo(() => {
    return leadsData.filter((item) => {
      const matchIndustry = industryFilter
        ? item.industry === industryFilter
        : true

      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase())

      return matchIndustry && matchSearch
    })
  }, [industryFilter, search])

  // 📄 PAGINATION
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">New Leads</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">
          New Leads
        </h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">

            {/* Search */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faFilter} className="w-3 h-3" />
                Filter
              </button>

              <SearchInput
                value={search}
                placeholder="Search name or company..."
                onChange={(val) => {
                  setSearch(val)
                  setCurrentPage(1)
                }}
              />
            </div>

          </div>

          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm">
            + Add
          </button>
        </div>

        {/* Filter Panel */}
        {showFilter && (
        <div className="mb-4 p-4 border rounded-lg bg-slate-50 flex gap-4 items-center">
          <FilterSelect
            value={industryFilter}
            onChange={(val) => {
              setIndustryFilter(val)
              setCurrentPage(1)
            }}
            options={[
              { label: "Tech Services", value: "Tech Services" },
              { label: "Logistics", value: "Logistics" },
              { label: "Finance", value: "Finance" },
            ]}
          />

          <button
            onClick={() => setIndustryFilter("")}
            className="text-sm text-sky-600"
          >
            Reset
          </button>
        </div>
        )}

        {/* Table */}
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">ID</th>
              <th className="text-left py-3 px-3">Name</th>
              <th className="text-left py-3 px-3">PIC</th>
              <th className="text-left py-3 px-3">Company</th>
              <th className="text-left py-3 px-3">Period</th>
              <th className="text-left py-3 px-3">Industry</th>
              <th className="text-left py-3 px-3">Last Update</th>
              <th className="text-left py-3 px-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-6 text-slate-400"
                >
                  No data found
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="py-3 px-3">{item.id}</td>
                <td className="py-3 px-3 font-medium">{item.name}</td>
                <td className="py-3 px-3">{item.pic}</td>
                <td className="py-3 px-3">{item.company}</td>
                <td className="py-3 px-3">{item.period}</td>
                <td className="py-3 px-3">{item.industry}</td>
                <td className="py-3 px-3">{item.lastUpdate}</td>
                <td className="py-3 px-3 flex gap-4">
                  <FontAwesomeIcon
                    icon={faPencil}
                    className="w-4 h-4 text-sky-500 cursor-pointer"
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="w-4 h-4 text-red-500 cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <p className="text-slate-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(
              currentPage * ITEMS_PER_PAGE,
              filteredData.length
            )}{" "}
            of {filteredData.length} entries
          </p>

          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? "bg-sky-500 text-white border-sky-500"
                      : ""
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
