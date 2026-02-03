"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
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
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: ITEMS_PER_PAGE,
    total_pages: 1,
    total_items: 0
  })

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Array<{id: string, field: string, value: string}>>([])

  const fieldOptions = [
    { label: "Stage", value: "current_stages" },
    { label: "Partner", value: "partner_name" },
    { label: "Company", value: "company" },
    { label: "Contact", value: "contact_name" },
  ]

  const fetchLeads = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('📥 Fetching leads data... Page:', page)
      
      const response = await axiosInstance.post<LeadsResponse>(
        '/api/leads/',
        {
          page_number: page,
          page_size: ITEMS_PER_PAGE,
          sort_by: 'id',
          sort_order: 'DESC',
        }
      )
      
      console.log('📦 Response:', response.data)

      if (response.data.code === 200) {
        console.log('✅ Leads data fetched:', response.data.data.list.length, 'items')
        setLeadsData(response.data.data.list)
        setPagination(response.data.data.pagination)
        setCurrentPage(response.data.data.pagination.current_page)
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
    fetchLeads(currentPage)
  }, [currentPage])

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
        await fetchLeads(currentPage)
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
      year: 'numeric'
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
              onClick={() => fetchLeads(1)}
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
              onClick={() => fetchLeads(currentPage)}
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 whitespace-nowrap">ID</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Name</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Contact</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Company</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Period</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Stage</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Partner</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    {search || filters.length > 0 
                      ? (
                        <div>
                          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="font-medium">No results found</p>
                          <p className="text-xs mt-1">Try adjusting your search or filters</p>
                        </div>
                      )
                      : (
                        <div>
                          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="font-medium">No leads data available</p>
                          <p className="text-xs mt-1">Click '+ Add' to create a new lead</p>
                        </div>
                      )
                    }
                  </td>
                </tr>
              )}

              {filteredLeads.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-50 transition ${
                    index !== filteredLeads.length - 1 ? 'border-b border-slate-200' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleIdClick(item.id)}
                      className="text-sky-500 hover:text-sky-700 font-medium hover:underline transition"
                    >
                      #{item.id}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-medium">{item.name}</td>
                  <td className="py-3 px-3">
                    {item.contact_name || (
                      <span className="text-slate-400 text-xs italic">No contact</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.company || (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{formatDate(item.period)}</td>
                  <td className="py-3 px-3">{getStageBadge(item.current_stages)}</td>
                  <td className="py-3 px-3 text-xs">{item.partner_name}</td>
                  <td className="py-3 px-3">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - UNIFIED STYLE */}
        <div className="flex items-center justify-end mt-4 pt-4 border-t text-black">
          {pagination.total_pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              totalItems={pagination.total_items}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}