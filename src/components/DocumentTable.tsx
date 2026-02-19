"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SearchBar } from "@/components/table/SearchBar"
import { Pagination } from "@/components/table/Pagination"
import axiosInstance from "@/lib/axios"
import { Document, DocumentsResponse, DOCUMENT_TYPES } from "@/types/document"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"

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
        // Placeholder for Edit Logic
        alert(`Edit Document ${doc.number}. This would open an edit modal or page.`)
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
    const [selectedDocName, setSelectedDocName] = useState<string>('')

    const fetchDocuments = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await axiosInstance.post<DocumentsResponse>(
                '/api/documents/',
                {
                    page_number: currentPage,
                    page_size: itemsPerPage,
                    sort_by: 'id',
                    sort_order: 'DESC',
                    ...(selectedDocName && { document_type: selectedDocName }),
                    ...(search && { search: search }),
                    // Pass moduleId if needed by backend
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
                // Handle API success=false case
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

    // Reload when page, size, or filters change
    useEffect(() => {
        fetchDocuments()
    }, [currentPage, itemsPerPage, selectedDocName, moduleId])

    // Debounce search could be added here, but for now we rely on the state update to trigger fetch
    // Use a timeout for search to avoid too many requests
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== '') fetchDocuments()
            // If search is empty, the dependency above on other vars or initial load covers it, 
            // but if we just cleared search, we want to fetch.
            else if (search === '' && !isLoading) fetchDocuments()
        }, 500)
        return () => clearTimeout(timer)
    }, [search])


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
        <div className="bg-white rounded-xl shadow-sm border border-slate-100">
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

            <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Documents</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage and view all your documents</p>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="relative">
                            <select
                                className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer hover:bg-slate-100 transition"
                                value={selectedDocName}
                                onChange={(e) => {
                                    setSelectedDocName(e.target.value)
                                    setCurrentPage(1)
                                }}
                            >
                                <option value="">All Types</option>
                                {DOCUMENT_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            placeholder="Search by number..."
                        />

                        <button
                            onClick={() => fetchDocuments()}
                            className="p-2 text-slate-600 hover:text-sky-500 transition rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
                            title="Refresh"
                        >
                            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>

                        <button
                            onClick={handleAdd}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Document
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="py-4 px-6 whitespace-nowrap">Number</th>
                            <th className="py-4 px-6 whitespace-nowrap">Type</th>
                            <th className="py-4 px-6 whitespace-nowrap">Name</th>
                            <th className="py-4 px-6 whitespace-nowrap">Project ID</th>
                            <th className="py-4 px-6 whitespace-nowrap">Quotation ID</th>
                            <th className="py-4 px-6 whitespace-nowrap text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-slate-400">
                                    {search || selectedDocName
                                        ? (
                                            <div>
                                                <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <p className="font-medium text-slate-600">No results found</p>
                                                <p className="text-xs mt-1 text-slate-400">Try adjusting your search or filters</p>
                                            </div>
                                        )
                                        : (
                                            <div>
                                                <svg className="w-16 h-16 mx-auto mb-4 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <h3 className="text-lg font-medium text-slate-900">No documents available</h3>
                                                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                                                    There are no documents recorded in the system yet.
                                                </p>
                                            </div>
                                        )
                                    }
                                </td>
                            </tr>
                        ) : (
                            data.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50/80 transition group">
                                    <td className="py-4 px-6 font-medium text-slate-900">
                                        {doc.number}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${getDocBadgeColor(doc.document_type)}`}>
                                            {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type || 'Other'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600">
                                        {doc.name || <span className="text-slate-400 italic">-</span>}
                                    </td>
                                    <td className="py-4 px-6 text-slate-600">
                                        {doc.project_id ? `#${doc.project_id}` : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-4 px-6 text-slate-600">
                                        {doc.quotation_id ? `#${doc.quotation_id}` : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleEdit(doc)}
                                                className="text-sky-500 hover:text-sky-700 transition"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(doc)}
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
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 0 && (
                <div className="px-6 pb-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </div>
            )}
        </div>
    )
}
