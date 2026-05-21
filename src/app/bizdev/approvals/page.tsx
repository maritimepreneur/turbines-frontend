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

type Approval = {
  id: number
  status: string
  type: string
  code: string
  quotation_id: number
  po_id: number
  invoice_id: number
  expense_id: number
  lead_id: number
}

interface ApprovalsResponse {
  message: string
  code: number
  data: {
    list: Approval[]
    pagination: {
      current_page: number
      page_size: number
      total_pages: number
      total_items: number
    }
  }
}

export default function ApprovalsPage() {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)
  const [approvalsData, setApprovalsData] = useState<Approval[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [approvalToDelete, setApprovalToDelete] = useState<{ id: number; code: string } | null>(null)
  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "info"
  }>({ isOpen: false, title: "", message: "", type: "success" })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [pagination, setPagination] = useState({ current_page: 1, page_size: 5, total_pages: 1, total_items: 0 })
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Array<{ id: string; field: string; value: string }>>([])
  
  const [activeTab, setActiveTab] = useState('New Request')
  const stages = ['New Request', 'Pending', 'Approved', 'Rejected']

  const fieldOptions = [
    { label: "Type", value: "type" },
    { label: "Code", value: "code" },
  ]

  const fetchApprovals = async () => {
    try {
      setIsLoading(true); setError(null)
      // Try POST first (pagination body), fall back to GET if 405
      let response: any
      try {
        response = await axiosInstance.post<ApprovalsResponse>('/api/approvals/', {
          page_number: 1, page_size: 1000, sort_by: 'id', sort_order: 'DESC'
        })
      } catch (postErr: any) {
        if (postErr.response?.status === 405) {
          // Backend doesn't accept POST for listing — use GET
          response = await axiosInstance.get<ApprovalsResponse>('/api/approvals/', {
            params: { page_number: 1, page_size: 1000, sort_by: 'id', sort_order: 'DESC' }
          })
        } else {
          throw postErr
        }
      }
      if (response.data.code === 200) {
        setApprovalsData(response.data.data.list || [])
        setPagination(response.data.data.pagination || { current_page: 1, page_size: 5, total_pages: 1, total_items: 0 })
      } else if (Array.isArray(response.data.data)) {
        // Handle flat array response
        setApprovalsData(response.data.data)
      } else if (Array.isArray(response.data)) {
        setApprovalsData(response.data)
      } else {
        throw new Error(response.data.message || 'Failed to fetch approvals')
      }
    } catch (err: any) {
      if (err.response?.status === 401) { setError('Session expired.'); router.push('/login') }
      else {
        const msg: string = err.response?.data?.message || err.message || ''
        if (msg.includes('UndefinedColumn') || msg.includes('does not exist') || msg.includes('psycopg')) {
          setError('DATABASE_ERROR:' + msg)
        } else {
          setError(msg || 'Failed to load approvals data.')
        }
      }
    } finally { setIsLoading(false) }
  }

  useEffect(() => {
    fetchApprovals()
  }, [])

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      setIsUpdatingStatus(id)
      // Try PUT first, then PATCH if 405
      let response: any
      try {
        response = await axiosInstance.put(`/api/approvals/${id}`, { status: newStatus })
      } catch (putErr: any) {
        if (putErr.response?.status === 405) {
          response = await axiosInstance.patch(`/api/approvals/${id}`, { status: newStatus })
        } else {
          throw putErr
        }
      }
      if (response.data.code === 200 || response.data.code === 201 || response.status === 200) {
        setNotification({ isOpen: true, title: "Success", message: `Status updated to ${newStatus}`, type: "success" })
        await fetchApprovals() // Refresh data
      } else {
        throw new Error(response.data.message || 'Failed to update status')
      }
    } catch (err: any) {
      const statusCode = err.response?.status
      const msg = statusCode === 405
        ? 'Status update is not supported by this backend endpoint.'
        : err.response?.data?.message || 'Failed to update status'
      setNotification({ isOpen: true, title: "Error", message: msg, type: "error" })
    } finally {
      setIsUpdatingStatus(null)
    }
  }

  const filteredApprovals = useMemo(() => {
    let filtered = [...approvalsData]
    
    // Filter by tab
    if (activeTab === 'New Request') {
      filtered = filtered.filter(a => !a.status || a.status.toLowerCase() === 'new' || a.status.toLowerCase() === 'new request')
    } else {
      filtered = filtered.filter(a => a.status?.toLowerCase() === activeTab.toLowerCase())
    }

    if (search) {
      filtered = filtered.filter(a =>
        a.type?.toLowerCase().includes(search.toLowerCase()) ||
        a.code?.toLowerCase().includes(search.toLowerCase())
      )
    }
    filters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(a => {
          const fieldValue = a[filter.field as keyof Approval]
          return fieldValue && String(fieldValue).toLowerCase().includes(filter.value.toLowerCase())
        })
      }
    })
    return filtered
  }, [approvalsData, search, filters, activeTab])

  const paginatedApprovals = useMemo(() => {
    if (itemsPerPage >= 99999) return filteredApprovals
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredApprovals.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredApprovals, currentPage, itemsPerPage])

  const totalPages = filteredApprovals.length === 0
    ? 0
    : Math.max(1, Math.ceil(filteredApprovals.length / (itemsPerPage >= 99999 ? filteredApprovals.length : itemsPerPage)))

  const handleConfirmDelete = async () => {
    if (!approvalToDelete) return
    try {
      setIsDeleting(approvalToDelete.id)
      const response = await axiosInstance.delete(`/api/approvals/${approvalToDelete.id}`)
      if (response.data.code === 200) {
        await fetchApprovals()
        setNotification({ isOpen: true, title: "Success", message: "Approval deleted successfully", type: "success" })
      } else throw new Error(response.data.message || 'Failed to delete approval')
    } catch (err: any) {
      setNotification({ isOpen: true, title: "Error", message: err.response?.data?.message || "Failed to delete approval", type: "error" })
    } finally { setIsDeleting(null); setApprovalToDelete(null) }
  }

  const addFilter = () => setFilters([...filters, { id: Date.now().toString(), field: fieldOptions[0].value, value: '' }])
  const removeFilter = (id: string) => setFilters(filters.filter(f => f.id !== id))
  const updateFilterField = (id: string, field: string) => setFilters(filters.map(f => f.id === id ? { ...f, field, value: '' } : f))
  const updateFilterValue = (id: string, value: string) => setFilters(filters.map(f => f.id === id ? { ...f, value } : f))
  const resetFilters = () => { setFilters([]); setSearch('') }

  if (isLoading && approvalsData.length === 0) return (
    <div>
      <div className="mb-6"><p className="text-sm text-slate-400">Bizdev / <span className="text-slate-600">Approvals</span></p><h1 className="text-2xl font-semibold mt-1 text-black">Approvals</h1></div>
      <div className="bg-white rounded-xl shadow-sm p-6"><div className="flex items-center justify-center py-12"><div className="text-center"><div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" /><p className="text-slate-600">Loading...</p></div></div></div>
    </div>
  )

  if (error && approvalsData.length === 0) {
    const isDbError = error.startsWith('DATABASE_ERROR:')
    const cleanMsg = isDbError ? error.replace('DATABASE_ERROR:', '') : error
    return (
      <div>
        <div className="mb-6"><p className="text-sm text-slate-400">Bizdev / <span className="text-slate-600">Approvals</span></p><h1 className="text-2xl font-semibold mt-1 text-black">Approvals</h1></div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-12 max-w-lg mx-auto text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDbError ? 'bg-orange-100' : 'bg-red-100'}`}>
              {isDbError ? (
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
              ) : (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            {isDbError ? (
              <>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Backend Database Error</h3>
                <p className="text-sm text-slate-500 mb-3">The API returned a database schema error. A column referenced by the backend does not exist in the database.</p>
                <div className="w-full bg-orange-50 border border-orange-200 rounded-lg p-3 text-left mb-4">
                  <p className="text-xs font-mono text-orange-700 break-all line-clamp-4">{cleanMsg}</p>
                </div>
                <p className="text-xs text-slate-400 mb-4">Please ask the backend developer to run the latest database migrations.</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Data</h3>
                <p className="text-slate-500 text-sm mb-4">{cleanMsg}</p>
              </>
            )}
            <button onClick={fetchApprovals} className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition text-sm">Try Again</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} title="Delete Approval" message={`Are you sure you want to delete "${approvalToDelete?.code}"?`} confirmText="Delete" cancelText="Cancel" type="reject" />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} title={notification.title} message={notification.message} type={notification.type} />

      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev / <span className="text-slate-600">Approvals</span></p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-2xl font-semibold mt-1 text-black">Approvals</h1>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{pagination.total_items}</span> approvals</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => { setActiveTab(stage); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${activeTab === stage
                ? 'bg-sky-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {stage}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowFilter(!showFilter)} className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-sky-600 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filter
              {filters.length > 0 && <span className="bg-white text-sky-500 rounded-full px-2 py-0.5 text-xs font-semibold">{filters.length}</span>}
            </button>
            <SearchBar value={search} onChange={setSearch} placeholder="Search type, code..." />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={fetchApprovals} disabled={isLoading} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50 flex-1 sm:flex-none">
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
            <Link href="/bizdev/approvals/add-approval" className="flex-1 sm:flex-none">
              <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition w-full">+ Add</button>
            </Link>
          </div>
        </div>

        <FilterPanel show={showFilter} filters={filters} onAddFilter={addFilter} onRemoveFilter={removeFilter} onUpdateField={updateFilterField} onUpdateValue={updateFilterValue} onResetAll={resetFilters} fieldOptions={fieldOptions} />

        <div className="mt-4">
          <ResponsiveTable<Approval>
            columns={[
              { header: 'Approval Type', accessor: 'type', isPrimary: true, cellClassName: 'font-medium' },
              { header: 'ID', accessor: 'id' },
              { header: 'Code', accessor: 'code' },
              { header: 'Quotation ID', accessor: 'quotation_id' },
              { header: 'PO ID', accessor: 'po_id' },
              { header: 'Invoice ID', accessor: 'invoice_id' },
              { header: 'Expense ID', accessor: 'expense_id' },
              { header: 'Leads ID', accessor: 'lead_id' },
              {
                header: 'Status',
                render: (item) => {
                  const statusColors: Record<string, string> = {
                    'pending': 'bg-yellow-100 text-yellow-700',
                    'approved': 'bg-green-100 text-green-700',
                    'rejected': 'bg-red-100 text-red-700',
                    'new request': 'bg-sky-100 text-sky-700',
                    'new': 'bg-sky-100 text-sky-700'
                  }
                  const status = item.status?.toLowerCase() || 'new request'
                  const colorClass = statusColors[status] || 'bg-slate-100 text-slate-700'
                  return (
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${colorClass}`}>
                      {item.status || 'New Request'}
                    </span>
                  )
                }
              },
              {
                header: 'Change Status',
                render: (item) => (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'Pending')}
                      disabled={isUpdatingStatus === item.id || item.status?.toLowerCase() === 'pending'}
                      className="px-2 py-1 text-xs font-medium rounded border border-yellow-500 text-yellow-600 hover:bg-yellow-50 disabled:opacity-50 transition"
                    >
                      Pending
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'Approved')}
                      disabled={isUpdatingStatus === item.id || item.status?.toLowerCase() === 'approved'}
                      className="px-2 py-1 text-xs font-medium rounded border border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-50 transition"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(item.id, 'Rejected')}
                      disabled={isUpdatingStatus === item.id || item.status?.toLowerCase() === 'rejected'}
                      className="px-2 py-1 text-xs font-medium rounded border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                )
              },
              {
                header: 'Action',
                render: (item) => (
                  <div className="flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/bizdev/approvals/edit-approval?id=${item.id}`) }} className="text-sky-500 hover:text-sky-700 transition" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setApprovalToDelete({ id: item.id, code: item.code }); setShowDeleteModal(true) }} disabled={isDeleting === item.id} className="text-red-500 hover:text-red-700 transition disabled:opacity-50" title="Delete">
                      {isDeleting === item.id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    </button>
                  </div>
                ),
              },
            ]}
            data={paginatedApprovals}
            keyAccessor={(item) => item.id}
            showTopBorder={false}
            emptyState={search || filters.length > 0 ? <EmptyState type="search" /> : <EmptyState title="No approvals data available" description="Click '+ Add' to create a new approval" />}
          />
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredApprovals.length} itemsPerPage={itemsPerPage} onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1) }} />
      </div>
    </div>
  )
}