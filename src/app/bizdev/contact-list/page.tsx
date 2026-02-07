"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"
import { getContactList } from "@/services/contactService"

/* =======================
   TYPES
======================= */

// data asli dari API
type ContactAPI = {
  id: number
  name: string
  emails: string[]
  phone_numbers: string[]
  company: string
  partner_id: number
  created_at: string
}

// data yang dipakai UI (table)
type ContactUI = {
  id: string
  name: string
  emails: string
  phone_numbers: string
  company: string[]
  type: string[]
}

/* =======================
   FALLBACK DATA
======================= */

const fallbackContacts: ContactUI[] = [
  {
    id: "ID/001/CT/2024",
    name: "Budi Santoso",
    emails: "budi@mahakarya.co.id",
    phone_numbers: "0812-xxx-xxxx",
    company: ["PT Mahakarya"],
    type: ["Client"],
  },
  {
    id: "ID/002/CT/2024",
    name: "Siti Aisyah",
    emails: "siti@digibluecamp.id",
    phone_numbers: "0821-xxx-xxxx",
    company: ["Digibluecamp"],
    type: ["Partner"],
  },
]

/* =======================
   PAGE
======================= */

export default function ContactsPage() {
  const [showFilter, setShowFilter] = useState(false)
  const [contacts, setContacts] = useState<ContactUI[]>([])
  const [loading, setLoading] = useState(true)

  /* =======================
     FETCH DATA
  ======================= */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await getContactList()

        const mappedContacts: ContactUI[] = res.data.map(
          (item: ContactAPI) => ({
            id: `ID/${item.id}/CT/2024`,
            name: item.name,
            emails: item.emails?.[0] ?? "-",
            phone_numbers: item.phone_numbers?.[0] ?? "-",
            company: [item.company],
            type: ["Partner"], // sementara (API belum ada)
          })
        )

        setContacts(mappedContacts)
      } catch (error) {
        console.error("Failed to fetch contacts:", error)
        setContacts(fallbackContacts)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  /* =======================
     TABLE FILTERS
  ======================= */
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
  } = useTableFilters(contacts, 5)

  const fieldOptions = [
    { label: "Company", value: "company" },
    { label: "Name", value: "name" },
  ]

  /* =======================
     RENDER
  ======================= */
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Contact List</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">
          Contact List
        </h1>
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

          <Link href="/bizdev/contact-list/add-contact">
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

        {/* Table */}
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">ID</th>
              <th className="text-left py-3 px-3">Name</th>
              <th className="text-left py-3 px-3">Email</th>
              <th className="text-left py-3 px-3">Phone</th>
              <th className="text-left py-3 px-3">Company</th>
              <th className="text-left py-3 px-3">Type</th>
              <th className="text-left py-3 px-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-400">
                  No data found
                </td>
              </tr>
            )}

            {!loading &&
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50 transition"
                >
                  <td className="py-3 px-3">{item.id}</td>
                  <td className="py-3 px-3 font-medium">{item.name}</td>
                  <td className="py-3 px-3">{item.emails}</td>
                  <td className="py-3 px-3">{item.phone_numbers}</td>
                  <td className="py-3 px-3">
                    {item.company.join(", ")}
                  </td>
                  <td className="py-3 px-3">
                    {item.type.join(", ")}
                  </td>
                  <td className="py-3 px-3">—</td>
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
