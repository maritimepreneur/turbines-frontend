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
import * as XLSX from 'xlsx-js-style'

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

type Contact = {
  id: number
  name: string
  emails?: string[]
  partner_id?: number
  position?: string
  role?: string
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

interface ContactsResponse {
  message: string
  code: number
  data: { list: Contact[]; pagination: any }
}

export default function PartnerListPage() {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)
  const [partnersData, setPartnersData] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [contactsByPartnerId, setContactsByPartnerId] = useState<Record<number, Contact[]>>({})

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

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters])

  const fieldOptions = [
    { label: "Industry", value: "industry" },
    { label: "Company Type", value: "company_type" },
    { label: "Partner Type", value: "partner_type" },
    { label: "Service", value: "service" },
    { label: "Goods", value: "goods" },
  ]



  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch partners (critical — show error if fails)
        const partnerRes = await axiosInstance.post<PartnersResponse>('/api/partners/', {
          page_number: 1, page_size: 1000, sort_by: 'id', sort_order: 'DESC'
        })
        if (partnerRes.data.code === 200) {
          setPartnersData(partnerRes.data.data.list)
          setPagination(partnerRes.data.data.pagination)
        } else throw new Error(partnerRes.data.message || 'Failed to fetch partners')
      } catch (err: any) {
        if (err.response?.status === 401) { setError('Session expired.'); router.push('/login') }
        else setError(err.response?.data?.message || 'Failed to load partners data.')
      } finally { setIsLoading(false) }

      // Fetch contacts separately — non-blocking, silently ignore errors
      try {
        const contactRes = await axiosInstance.post<ContactsResponse>('/api/contacts/', {
          page_size: 1000
        })
        if (contactRes.data.code === 200) {
          const grouped: Record<number, Contact[]> = {}
          contactRes.data.data.list.forEach(c => {
            if (c.partner_id) {
              if (!grouped[c.partner_id]) grouped[c.partner_id] = []
              grouped[c.partner_id].push(c)
            }
          })
          setContactsByPartnerId(grouped)
        }
      } catch {
        // Contacts API failed — PIC column will show "—", but partner list still works fine
      }
    }
    fetchAll()
  }, [])

  const fetchPartners = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axiosInstance.post<PartnersResponse>('/api/partners/', {
        page_number: 1, page_size: 1000, sort_by: 'id', sort_order: 'DESC'
      })
      if (response.data.code === 200) {
        setPartnersData(response.data.data.list)
        setPagination(response.data.data.pagination)
      } else throw new Error(response.data.message || 'Failed to fetch partners')
    } catch (err: any) {
      if (err.response?.status === 401) { setError('Session expired.'); router.push('/login') }
      else setError(err.response?.data?.message || 'Failed to load partners data.')
    } finally { setIsLoading(false) }
  }

  const filteredPartners = useMemo(() => {
    let filtered = [...partnersData]

    if (search) {
      filtered = filtered.filter(partner =>
        (partner.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (partner.initials || '').toLowerCase().includes(search.toLowerCase())
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

    // Urutkan sesuai abjad (A-Z) berdasarkan nama perusahaan
    filtered.sort((a, b) => {
      const nameA = a.name ? a.name.trim() : ''
      const nameB = b.name ? b.name.trim() : ''
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true })
    })

    return filtered
  }, [partnersData, search, filters])

  // Deteksi nama company yang duplikat di database
  const duplicateCompanyNames = useMemo(() => {
    const counts = new Map<string, number>()
    partnersData.forEach((p) => {
      if (p.name) {
        const key = p.name.trim().toLowerCase()
        counts.set(key, (counts.get(key) || 0) + 1)
      }
    })
    const dupes = new Set<string>()
    counts.forEach((count, key) => {
      if (count > 1) dupes.add(key)
    })
    return dupes
  }, [partnersData])

  // Client-side pagination
  const paginatedPartners = useMemo(() => {
    if (itemsPerPage >= 99999) return filteredPartners
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredPartners.slice(startIndex, endIndex)
  }, [filteredPartners, currentPage, itemsPerPage])

  const totalPages = filteredPartners.length === 0
    ? 0
    : Math.max(1, Math.ceil(filteredPartners.length / (itemsPerPage >= 99999 ? filteredPartners.length : itemsPerPage)))

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

  const handleDownloadExcel = () => {
    const dataToExport = filteredPartners.map((partner, index) => {
      const pics = contactsByPartnerId[partner.id]
      const picNames = pics && pics.length > 0 ? pics.map(p => p.name).join(', ') : '-'
      return {
        No: index + 1,
        'Company Name': partner.name,
        Initial: partner.initials || '-',
        Industry: partner.industry || '-',
        Service: partner.service || '-',
        Goods: partner.goods || '-',
        'Company Type': partner.company_type || '-',
        'Partner Type': partner.partner_type || '-',
        PIC: picNames,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)

    const columnWidths = [
      { wch: 6 },   // No
      { wch: 35 },  // Company Name
      { wch: 12 },  // Initial
      { wch: 25 },  // Industry
      { wch: 20 },  // Service
      { wch: 20 },  // Goods
      { wch: 18 },  // Company Type
      { wch: 18 },  // Partner Type
      { wch: 30 },  // PIC
    ]
    worksheet['!cols'] = columnWidths

    // Styling header dengan warna hijau
    const headerStyle = {
      fill: { fgColor: { rgb: "22C55E" } },
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" }
    }

    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1']
    headerCells.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = headerStyle
      }
    })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Partner List')
    XLSX.writeFile(workbook, `Affiliation_List_${new Date().toISOString().split('T')[0]}.xlsx`)
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
              onClick={handleDownloadExcel}
              disabled={filteredPartners.length === 0}
              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>

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

        {duplicateCompanyNames.size > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start sm:items-center gap-2.5 text-sm text-amber-800">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <span className="font-semibold">Pemberitahuan Duplikat:</span> Terdapat <strong>{duplicateCompanyNames.size}</strong> nama perusahaan yang terdaftar lebih dari satu kali. Baris dengan nama ganda telah ditandai dengan label <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-200 text-amber-900">Duplikat</span>.
            </div>
          </div>
        )}

        <div className="mt-4">
          <ResponsiveTable<Partner>
            columns={[
              {
                header: 'No',
                render: (_, index) => (currentPage - 1) * itemsPerPage + index + 1,
              },
              {
                header: 'Company Name',
                isPrimary: true,
                cellClassName: 'font-medium',
                render: (item) => {
                  const isDupe = duplicateCompanyNames.has((item.name || '').trim().toLowerCase())
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-900">{item.name}</span>
                      {isDupe && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"
                          title="Pemberitahuan: Nama company ini terdaftar lebih dari 1 kali (Duplikat)"
                        >
                          <svg className="w-3 h-3 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Duplikat
                        </span>
                      )}
                    </div>
                  )
                },
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
                header: 'PIC',
                render: (item) => {
                  const pics = contactsByPartnerId[item.id]
                  if (!pics || pics.length === 0) return <span className="text-slate-400 text-xs">—</span>
                  return (
                    <div className="flex flex-col gap-1.5">
                      {pics.map(pic => (
                        <div key={pic.id} className="flex items-center gap-2">
                          <div className="shrink-0 w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-semibold">
                            {pic.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">{pic.name}</p>
                            {pic.position && <p className="text-xs text-slate-400 truncate">{pic.position}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                },
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPartners.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </div>
  )
}
