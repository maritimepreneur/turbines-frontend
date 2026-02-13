"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

type Contact = {
  id: number
  name: string
  emails?: string[]
  phone_numbers?: string[]
  company?: string
  created_at?: string
}

interface ContactsResponse {
  message: string
  code: number
  data: {
    list: Contact[]
    pagination: {
      current_page: number
      page_size: number
      total_pages: number
      total_items: number
    }
  }
}

export default function ContactListPage() {
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)
  const [contactsData, setContactsData] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<{ id: number, name: string } | null>(null)
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
    { label: "Name", value: "name" },
    { label: "Email", value: "emails" },
    { label: "Company", value: "company" },
  ]

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axiosInstance.post<ContactsResponse>(
        '/api/contacts/',
        {
          params: {
            page_number: 1,
            page_size: 1000, // Fetch all data
            sort_by: 'id',
            sort_order: 'DESC',
          }
        }
      )

      if (response.data.code === 200) {
        setContactsData(response.data.data.list)
        setPagination(response.data.data.pagination)
      } else {
        throw new Error(response.data.message || 'Failed to fetch contacts')
      }
    } catch (err: any) {
      console.error('❌ Error fetching contacts:', err)

      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
        router.push('/login')
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to load contacts data. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const filteredContacts = useMemo(() => {
    let filtered = [...contactsData]

    if (search) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.emails?.some(email => email.toLowerCase().includes(search.toLowerCase())) ||
        contact.company?.toLowerCase().includes(search.toLowerCase())
      )
    }

    filters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(contact => {
          const fieldValue = filter.field === 'emails'
            ? contact.emails?.join(', ')
            : contact[filter.field as keyof Contact]
          return fieldValue &&
            String(fieldValue).toLowerCase().includes(filter.value.toLowerCase())
        })
      }
    })

    return filtered
  }, [contactsData, search, filters])

  // Client-side pagination
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredContacts.slice(startIndex, endIndex)
  }, [filteredContacts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)

  const handleEdit = (contactId: number) => {
    router.push(`/bizdev/contact-list/edit-contact?id=${contactId}`)
  }

  const handleDeleteClick = (id: number, name: string) => {
    setContactToDelete({ id, name })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return

    try {
      setIsDeleting(contactToDelete.id)

      const response = await axiosInstance.delete(`/api/contacts/${contactToDelete.id}`)

      if (response.data.code === 200) {
        await fetchContacts()
        setNotification({
          isOpen: true,
          title: "Success",
          message: "Contact deleted successfully",
          type: "success"
        })
      } else {
        throw new Error(response.data.message || 'Failed to delete contact')
      }
    } catch (err: any) {
      console.error('❌ Error deleting contact:', err)
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to delete contact",
        type: "error"
      })
    } finally {
      setIsDeleting(null)
      setContactToDelete(null)
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

  if (isLoading && contactsData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">Contact List</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Contact List</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading contacts data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && contactsData.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">Contact List</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Contact List</h1>
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
              onClick={() => fetchContacts()}
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
        title="Delete Contact"
        message={`Are you sure you want to delete contact "${contactToDelete?.name}"? This action cannot be undone.`}
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
          Bizdev / <span className="text-slate-600">Contact List</span>
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold mt-1 text-black">Contact List</h1>
          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{pagination.total_items}</span> contacts
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
              placeholder="Search name, email, or company..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fetchContacts()}
              disabled={isLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
              title="Refresh data"
            >
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <Link href="/bizdev/contact-list/add-contact">
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
                <th className="text-left py-3 px-3 whitespace-nowrap">Email</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Phone</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Company</th>
                <th className="text-left py-3 px-3 whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="font-medium">No contacts data available</p>
                          <p className="text-xs mt-1">Click '+ Add' to create a new contact</p>
                        </div>
                      )
                    }
                  </td>
                </tr>
              )}

              {paginatedContacts.map((item, index) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition ${index !== filteredContacts.length - 1 ? 'border-b border-slate-200' : ''
                    }`}
                >
                  <td className="py-3 px-3">{item.id}</td>
                  <td className="py-3 px-3 font-medium">{item.name}</td>
                  <td className="py-3 px-3">
                    {item.emails && item.emails.length > 0 ? (
                      item.emails[0]
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.phone_numbers && item.phone_numbers.length > 0 ? (
                      item.phone_numbers[0]
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.company || (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-sky-500 hover:text-sky-700 transition"
                        title="Edit contact"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id, item.name)}
                        disabled={isDeleting === item.id}
                        className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete contact"
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


        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredContacts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  )
}
