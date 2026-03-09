"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SearchBar } from "@/components/table/SearchBar"
import { Pagination } from "@/components/table/Pagination"
import { ResponsiveTable } from "@/components/table/ResponsiveTable"
import { EmptyState } from "@/components/table/EmptyState"
import axiosInstance from "@/lib/axios"
import { Document, DocumentsResponse, DOCUMENT_TYPES } from "@/types/document"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import { FilterPanel, FilterItem } from "@/components/table/FilterPanel"

interface DocumentTableProps {
    // Optional: Pass module context if the API endpoints or logic varies by module in the future
    moduleId?: 'bizdev' | 'finance' | 'operation';
}

const getDocBadgeColor = (type: string) => {
    const normalizedType = type?.toUpperCase() || '';
    const colors: Record<string, string> = {
        'QUOTATION': 'bg-yellow-100 text-yellow-800',
        'RECOMENDATION': 'bg-green-100 text-green-800',
        'RECOMENDATION LETTER': 'bg-green-100 text-green-800', // Handle full label
        'PO': 'bg-purple-100 text-purple-800',
        'PURCHASE ORDER': 'bg-purple-100 text-purple-800', // Handle full label
        'PUCHASE ORDER': 'bg-purple-100 text-purple-800', // Handle typo in data
        'INVOICE': 'bg-orange-100 text-orange-800',
        'MOU': 'bg-indigo-100 text-indigo-800',
        'TAX': 'bg-red-100 text-red-800',
        'REPORT': 'bg-cyan-100 text-cyan-800',
        'CERTIFICATE': 'bg-teal-100 text-teal-800',
        'AGREEMENT': 'bg-pink-100 text-pink-800',
        'OTHER': 'bg-slate-100 text-slate-800',
        // 'OTHER DOCUMENT': 'bg-slate-100 text-slate-800' // Handle legacy/display name
    }
    return colors[normalizedType] || 'bg-slate-100 text-slate-800'
}

export default function DocumentTable({ moduleId }: DocumentTableProps) {
    const [data, setData] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [docToDelete, setDocToDelete] = useState<Document | null>(null)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [showFilter, setShowFilter] = useState(false)

    // Notification State
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

    const router = useRouter()

    // Actions
    const handleAdd = () => {
        if (moduleId) {
            router.push(`/${moduleId}/documents/add`)
        } else {
            console.error("No Module ID provided for DocumentTable")
        }
    }

    const handleEdit = (doc: Document) => {
        if (moduleId) {
            router.push(`/${moduleId}/documents/${doc.id}/edit`)
        } else {
            console.error("No Module ID provided for DocumentTable")
        }
    }

    const handleDeleteClick = (doc: Document) => {
        setDocToDelete(doc)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!docToDelete) return

        try {
            setIsDeleting(docToDelete.id)
            const response = await axiosInstance.delete(`/api/documents/${docToDelete.id}`)

            if (response.data.code === 200) {
                await fetchDocuments()
                setNotification({
                    isOpen: true,
                    title: "Success",
                    message: "Document deleted successfully",
                    type: "success"
                })
            } else {
                throw new Error(response.data.message || 'Failed to delete document')
            }

        } catch (err: any) {
            console.error('Error deleting document:', err)
            setNotification({
                isOpen: true,
                title: "Error",
                message: err.message || "Failed to delete document",
                type: "error"
            })
        } finally {
            setIsDeleting(null)
            setShowDeleteModal(false)
            setDocToDelete(null)
        }
    }

    // Filters
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<FilterItem[]>([])

    const fieldOptions = [
        { label: "Type", value: "document_type" },
        { label: "Name", value: "name" },
    ]

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
        setCurrentPage(1)
        setFilters(filters.map(f => f.id === id ? { ...f, field, value: '' } : f))
    }

    const updateFilterValue = (id: string, value: string) => {
        setCurrentPage(1)
        setFilters(filters.map(f => f.id === id ? { ...f, value } : f))
    }

    const resetFilters = () => {
        setCurrentPage(1)
        setFilters([])
    }

    const hasActiveFilters = filters.some(f => f.value)

    const fetchDocuments = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await axiosInstance.post<DocumentsResponse>(
                '/api/documents/',
                {
                    page_number: hasActiveFilters ? 1 : currentPage,
                    page_size: hasActiveFilters ? 9999 : itemsPerPage,
                    sort_by: 'id',
                    sort_order: 'DESC',
                    ...(search && { search }),
                    ...(moduleId && { module: moduleId })
                }
            )

            if (response.data.code === 200) {
                setData(response.data.data.list || [])
                if (response.data.data.pagination) {
                    setTotalItems(response.data.data.pagination.total_items)
                    setTotalPages(response.data.data.pagination.total_pages)
                }
            } else {
                if (response.data.code !== 200) {
                    setError(response.data.message || 'Failed to fetch documents')
                }
            }

        } catch (err: any) {
            console.error('Error fetching documents:', err)
            setError(err.message || 'Failed to load documents')
        } finally {
            setIsLoading(false)
        }
    }

    // Re-fetch when filters become active/inactive (to switch between paginated and full data)
    useEffect(() => {
        const delay = search ? 400 : 0
        const timer = setTimeout(() => {
            fetchDocuments()
        }, delay)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, itemsPerPage, search, moduleId, hasActiveFilters])

    // Client-side filtering on fetched data
    const filteredData = useMemo(() => {
        if (!hasActiveFilters) return data
        let result = data
        filters.forEach(f => {
            if (f.value) {
                if (f.field === 'document_type') {
                    result = result.filter(doc =>
                        doc.document_type?.toLowerCase().includes(f.value.toLowerCase())
                    )
                } else if (f.field === 'name') {
                    result = result.filter(doc =>
                        doc.name?.toLowerCase().includes(f.value.toLowerCase())
                    )
                }
            }
        })
        return result
    }, [data, filters, hasActiveFilters])

    // Client-side pagination when filters are active
    const displayData = useMemo(() => {
        if (!hasActiveFilters) return filteredData
        const start = (currentPage - 1) * itemsPerPage
        return filteredData.slice(start, start + itemsPerPage)
    }, [filteredData, hasActiveFilters, currentPage, itemsPerPage])

    const displayTotalItems = hasActiveFilters ? filteredData.length : totalItems
    const displayTotalPages = hasActiveFilters ? Math.max(1, Math.ceil(filteredData.length / itemsPerPage)) : totalPages


    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleItemsPerPageChange = (items: number) => {
        setItemsPerPage(items)
        setCurrentPage(1)
    }

    if (isLoading && data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-slate-500 text-sm">Loading documents...</p>
                </div>
            </div>
        )
    }

    if (error && data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="bg-red-50 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-slate-800">Error Loading Data</h3>
                <p className="text-slate-500 mb-4">{error}</p>
                <button
                    onClick={fetchDocuments}
                    className="text-sky-500 hover:text-sky-600 font-medium hover:underline"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Document"
                message={`Are you sure you want to delete document "${docToDelete?.name}"? This action cannot be undone.`}
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
                        onChange={(val) => { setCurrentPage(1); setSearch(val) }}
                        placeholder="Search by name..."
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => fetchDocuments()}
                        disabled={isLoading}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
                        title="Refresh data"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>

                    <button
                        onClick={handleAdd}
                        className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition"
                    >
                        + Add
                    </button>
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
                <ResponsiveTable<Document>
                    columns={[
                        {
                            header: 'Number',
                            accessor: 'number',
                            cellClassName: 'font-medium text-slate-900',
                        },
                        {
                            header: 'Type',
                            isPrimary: true,
                            render: (doc) => (
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${getDocBadgeColor(doc.document_type)}`}>
                                    {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type || 'Other'}
                                </span>
                            ),
                        },
                        {
                            header: 'Name',
                            render: (doc) => doc.name || <span className="text-slate-400 italic">-</span>,
                            cellClassName: 'text-slate-600',
                        },
                        {
                            header: 'URL',
                            render: (doc) => doc.url
                                ? (
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={e => e.stopPropagation()}
                                        className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 hover:underline text-xs font-medium max-w-[160px] truncate"
                                        title={doc.url}
                                    >
                                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        <span className="truncate">{doc.url.replace(/^https?:\/\//, '')}</span>
                                    </a>
                                )
                                : <span className="text-slate-300">—</span>,
                        },
                        {
                            header: 'Description',
                            render: (doc) => doc.description
                                ? <span className="text-xs text-slate-600 line-clamp-2 max-w-[200px]" title={doc.description}>{doc.description}</span>
                                : <span className="text-slate-300">—</span>,
                        },
                        {
                            header: 'Project ID',
                            render: (doc) => doc.project_id ? `#${doc.project_id}` : <span className="text-slate-300">-</span>,
                            cellClassName: 'text-slate-600',
                        },
                        {
                            header: 'Quotation ID',
                            render: (doc) => doc.quotation_id ? `#${doc.quotation_id}` : <span className="text-slate-300">-</span>,
                            cellClassName: 'text-slate-600',
                        },
                        {
                            header: 'Actions',
                            render: (doc) => (
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(doc) }}
                                        className="text-sky-500 hover:text-sky-700 transition"
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(doc) }}
                                        disabled={isDeleting === doc.id}
                                        className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete"
                                    >
                                        {isDeleting === doc.id ? (
                                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        )}
                                    </button>
                                </div>
                            ),
                        },
                    ]}
                    data={displayData}
                    keyAccessor={(doc) => doc.id}
                    showTopBorder={false}
                    emptyState={
                        search || filters.some(f => f.value)
                            ? <EmptyState type="search" />
                            : <EmptyState title="No documents available" description="There are no documents recorded in the system yet." />
                    }
                />
            </div>


            {/* Pagination */}
            {displayTotalPages > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={displayTotalPages}
                    totalItems={displayTotalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />
            )}
        </div>
    )
}
