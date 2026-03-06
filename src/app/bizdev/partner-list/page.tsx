"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { ResponsiveTable } from "@/components/table/ResponsiveTable"
import { EmptyState } from "@/components/table/EmptyState"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

type Partner = {
  id: number
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string
  service?: string
  goods?: string
}

interface PartnersResponse {
  message: string
  code: number
  data: {
    list: Partner[]
    pagination: {
      current_page: number
      page_size: number
      total_pages: number
      total_items: number
    }
  }
}

export default function PartnerListPage() {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)
  const [partnersData, setPartnersData] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [partnerToDelete, setPartnerToDelete] = useState<{ id: number, name: string } | null>(null)
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: "success" | "error" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  })

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
    { label: "Industry", value: "industry" },
    { label: "Company Type", value: "company_type" },
    { label: "Partner Type", value: "partner_type" },
    { label: "Service", value: "service" },
    { label: "Goods", value: "goods" },
  ]

  const fetchPartners = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📥 Fetching all partners data...')

      const response = await axiosInstance.post<PartnersResponse>(
        '/api/partners/',
        {
          params: {
            page_number: 1,
            page_size: 1000, // Fetch all data
            sort_by: 'id',
            sort_order: 'DESC',
          }
        }
      )

      console.log('📦 Response:', response.data)

      if (response.data.code === 200) {
        console.log('✅ Partners data fetched:', response.data.data.list.length, 'items')
        setPartnersData(response.data.data.list)
        setPagination(response.data.data.pagination)
      } else {
        throw new Error(response.data.message || 'Failed to fetch partners')
      }
    } catch (err: any) {
      console.error('❌ Error fetching partners:', err)

      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        router.push('/login')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to load partners data. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPartners()
  }, [])

  const filteredPartners = useMemo(() => {
    let filtered = [...partnersData]

    if (search) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(search.toLowerCase()) ||
        partner.initials.toLowerCase().includes(search.toLowerCase())
      )
    }

    filters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(partner => {
          const fieldValue = partner[filter.field as keyof Partner]
          return fieldValue &&
            String(fieldValue).toLowerCase().includes(filter.value.toLowerCase())
        })
      }
    })

    return filtered
  }, [partnersData, search, filters])

  // Client-side pagination
  const paginatedPartners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredPartners.slice(startIndex, endIndex)
  }, [filteredPartners, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredPartners.length / itemsPerPage)

  const handleEdit = (partnerId: number) => {
    router.push(`/bizdev/partner-list/edit?id=${partnerId}`)
  }

  const handleDeleteClick = (id: number, name: string) => {
    setPartnerToDelete({ id, name })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!partnerToDelete) return

    try {
      setIsDeleting(partnerToDelete.id)

      const response = await axiosInstance.delete(`/api/partners/${partnerToDelete.id}`)

      if (response.data.code === 200) {
        setPartnersData(prev => prev.filter(p => p.id !== partnerToDelete.id))
        setNotification({
          isOpen: true,
          title: "Success",
          message: "Partner deleted successfully",
          type: "success"
        })
      } else {
        throw new Error(response.data.message || 'Failed to delete partner')
      }
    } catch (err: any) {
      console.error('❌ Error deleting partner:', err)
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to delete partner",
        type: "error"
      })
    } finally {
      setIsDeleting(null)
      setPartnerToDelete(null)
    }
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

  if (isLoading && partnersData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">Partner List</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Partner List</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading partners data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && partnersData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">Partner List</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Partner List</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Data</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => fetchPartners()}
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
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Partner"
        message={`Are you sure you want to delete partner "${partnerToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="reject"
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Partner List</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-2xl font-semibold mt-1 text-black">Partner List</h1>
          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{pagination.total_items}</span> partners
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
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

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => fetchPartners()}
              disabled={isLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
              title="Refresh data"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <Link href="/bizdev/partner-list/add" className="flex-1 sm:flex-none">
              <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition w-full">
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
          <ResponsiveTable<Partner>
            columns={[
              {
                header: 'ID',
                accessor: 'id',
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
                header: 'Service',
                render: (item) => item.service || (
                  <span className="text-slate-400 text-xs">-</span>
                ),
              },
              {
                header: 'Company Type',
                accessor: 'company_type',
              },
              {
                header: 'Partner Type',
                accessor: 'partner_type',
              },
              {
                header: 'Action',
                render: (item) => (
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(item.id) }}
                      className="text-sky-500 hover:text-sky-700 transition"
                      title="Edit partner"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id, item.name) }}
                      disabled={isDeleting === item.id}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete partner"
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
            data={paginatedPartners}
            keyAccessor={(item) => item.id}
            showTopBorder={false}
            emptyState={
              search || filters.length > 0
                ? <EmptyState type="search" />
                : <EmptyState title="No partners data available" description="Click '+ Add' to create a new partner" />
            }
          />
        </div>


        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPartners.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  )
}
