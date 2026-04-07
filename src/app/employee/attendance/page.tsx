"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { ResponsiveTable, TableColumn } from "@/components/table/ResponsiveTable"
import { EmptyState } from "@/components/table/EmptyState"
import axiosInstance from "@/lib/axios"

type Lead = {
  id: number
  name: string
  period: string
  description: string
  contact_id: number | null
  partner_id: number
  current_stages: string
  contact_name: string | null
  company: string | null
  partner_name: string
}

interface LeadsResponse {
  message: string
  code: number
  data: {
    list: Lead[]
    pagination: {
      current_page: number
      page_size: number
      total_pages: number
      total_items: number
    }
  }
}

const ITEMS_PER_PAGE = 5

export default function NewLeadsPage() {
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false)
  const [leadsData, setLeadsData] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 5,
    total_pages: 1,
    total_items: 0
  })

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Array<{ id: string, field: string, value: string }>>([])

  const fieldOptions = [
    { label: "Stage", value: "current_stages" },
    { label: "Partner", value: "partner_name" },
    { label: "Company", value: "company" },
    { label: "Contact", value: "contact_name" },
  ]

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📥 Fetching all leads data...')

      const response = await axiosInstance.post<LeadsResponse>(
        '/api/leads/',
        {
          page_number: 1,
          page_size: 1000, // Fetch all data
          sort_by: 'id',
          sort_order: 'DESC',
        }
      )

      console.log('📦 Response:', response.data)

      if (response.data.code === 200) {
        console.log('✅ Leads data fetched:', response.data.data.list.length, 'items')
        setLeadsData(response.data.data.list)
        setPagination(response.data.data.pagination)
      } else {
        throw new Error(response.data.message || 'Failed to fetch leads')
      }
    } catch (err: any) {
      console.error('❌ Error fetching leads:', err)

      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        router.push('/login')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to load leads data. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = useMemo(() => {
    let filtered = [...leadsData]

    if (search) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(search.toLowerCase())) ||
        (lead.contact_name && lead.contact_name.toLowerCase().includes(search.toLowerCase()))
      )
    }

    filters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(lead => {
          const fieldValue = lead[filter.field as keyof Lead]
          return fieldValue &&
            String(fieldValue).toLowerCase().includes(filter.value.toLowerCase())
        })
      }
    })

    return filtered
  }, [leadsData, search, filters])

  // Client-side pagination
  const paginatedLeads = useMemo(() => {
    if (itemsPerPage >= 99999) return filteredLeads
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLeads.slice(startIndex, endIndex)
  }, [filteredLeads, currentPage, itemsPerPage])

  const totalPages = filteredLeads.length === 0
    ? 0
    : Math.max(1, Math.ceil(filteredLeads.length / (itemsPerPage >= 99999 ? filteredLeads.length : itemsPerPage)))

  const handleIdClick = (leadId: number) => {
    router.push(`/bizdev/new-leads/general-info?id=${leadId}`);
  }

  const handleEdit = (leadId: number) => {
    router.push(`/bizdev/new-leads/edit-leads?id=${leadId}`)
  }

  const handleDelete = async (leadId: number, leadName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete lead "${leadName}"?`
    )

    if (!confirmDelete) return

    try {
      setIsDeleting(leadId)
      console.log('🗑️ Deleting lead:', leadId)

      const response = await axiosInstance.delete(`/api/leads/${leadId}`)

      if (response.data.code === 200) {
        console.log('✅ Lead deleted successfully')
        await fetchLeads()
        alert('Lead deleted successfully!')
      } else {
        throw new Error(response.data.message || 'Failed to delete lead')
      }
    } catch (err: any) {
      console.error('❌ Error deleting lead:', err)

      if (err.response?.data?.message) {
        alert(`Failed to delete: ${err.response.data.message}`)
      } else {
        alert('Failed to delete lead. Please try again.')
      }
    } finally {
      setIsDeleting(null)
    }
  }

  const getStageBadge = (stage: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      NEW: { bg: 'bg-blue-100', text: 'text-blue-700' },
      INTRODUCTION: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      PRESENTATION: { bg: 'bg-green-100', text: 'text-green-700' },
      QUOTATION: { bg: 'bg-purple-100', text: 'text-purple-700' },
      FU: { bg: 'bg-orange-100', text: 'text-orange-700' },
      MOU: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
      EXECUTION: { bg: 'bg-red-100', text: 'text-red-700' },
    }

    const badge = badges[stage] || { bg: 'bg-gray-100', text: 'text-gray-700' }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {stage}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    })
  }

  const addFilter = () => {
    const newFilter = {
      id: Date.now().toString(),
      field: fieldOptions[0].value,
      value: ''
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const updateFilterField = (id: string, field: string) => {
    setFilters(filters.map(f =>
      f.id === id ? { ...f, field, value: '' } : f
    ))
  }

  const updateFilterValue = (id: string, value: string) => {
    setFilters(filters.map(f =>
      f.id === id ? { ...f, value } : f
    ))
  }

  const resetFilters = () => {
    setFilters([])
    setSearch('')
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (newValue: number) => {
    setItemsPerPage(newValue)
    setCurrentPage(1)
  }

  if (isLoading && leadsData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">New Leads</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">New Leads</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading leads data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && leadsData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">New Leads</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">New Leads</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Data</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => fetchLeads()}
              className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">New Leads</span>
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mt-1 text-black">New Leads</h1>
          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{pagination.total_items}</span> leads
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
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
              placeholder="Search name, company, or contact..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fetchLeads()}
              disabled={isLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
              title="Refresh data"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <Link href="/bizdev/new-leads/add-leads">
              <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition">
                + Add
              </button>
            </Link>
          </div>
        </div>

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

        <div className="mt-4">
          <ResponsiveTable<Lead>
            columns={[
              {
                header: 'ID',
                accessor: 'id',
                isPrimary: true,
                render: (item) => (
                  <button
                    onClick={() => handleIdClick(item.id)}
                    className="text-sky-500 hover:text-sky-700 font-medium hover:underline transition"
                  >
                    #{item.id}
                  </button>
                ),
              },
              {
                header: 'Name',
                accessor: 'name',
                cellClassName: 'font-medium',
              },
              {
                header: 'Contact',
                render: (item) => item.contact_name || (
                  <span className="text-slate-400 text-xs italic">No contact</span>
                ),
              },
              {
                header: 'Company',
                render: (item) => item.company || (
                  <span className="text-slate-400 text-xs">-</span>
                ),
              },
              {
                header: 'Period',
                render: (item) => formatDate(item.period),
                cellClassName: 'whitespace-nowrap',
              },
              {
                header: 'Stage',
                render: (item) => getStageBadge(item.current_stages),
              },
              {
                header: 'Partner',
                accessor: 'partner_name',
                cellClassName: 'text-xs',
              },
              {
                header: 'Action',
                render: (item) => (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="text-sky-500 hover:text-sky-700 transition"
                      title="Edit lead"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={isDeleting === item.id}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete lead"
                    >
                      {isDeleting === item.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ),
              },
            ]}
            data={paginatedLeads}
            keyAccessor={(item) => item.id}
            emptyState={
              search || filters.length > 0
                ? <EmptyState type="search" />
                : <EmptyState title="No leads data available" description="Click '+ Add' to create a new lead" />
            }
          />
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredLeads.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  )
}