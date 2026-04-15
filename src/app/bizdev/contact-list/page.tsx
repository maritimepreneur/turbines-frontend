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
import { UN_MEMBER_STATES } from "@/lib/countries"

type Partner = {
  id: number
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string
}

type Contact = {
  id: number
  name: string
  emails?: string[]
  phone_numbers?: string[]
  company?: string
  partners?: Partner[]
  position?: string
  role?: string
  nasionality?: string
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

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<{ id: number; name: string } | null>(null)
  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "info"
  }>({ isOpen: false, title: "", message: "", type: "success" })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [pagination, setPagination] = useState({ current_page: 1, page_size: 5, total_pages: 1, total_items: 0 })
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Array<{ id: string; field: string; value: string }>>([])

  const fieldOptions = [
    { label: "Name", value: "name" },
    { label: "Email", value: "emails" },
    { label: "Position", value: "position" },
    { label: "Role", value: "role" },
    { label: "Country", value: "nasionality" },
  ]

  const fetchContacts = async () => {
    try {
      setIsLoading(true); setError(null)
      const response = await axiosInstance.post<ContactsResponse>('/api/contacts/', {
        page_number: 1, page_size: 1000, sort_by: 'id', sort_order: 'DESC'
      })
      if (response.data.code === 200) {
        setContactsData(response.data.data.list)
        setPagination(response.data.data.pagination)
      } else throw new Error(response.data.message || 'Failed to fetch contacts')
    } catch (err: any) {
      if (err.response?.status === 401) { setError('Session expired.'); router.push('/login') }
      else {
        const msg: string = err.response?.data?.message || err.message || ''
        // Detect backend DB schema errors
        if (msg.includes('UndefinedColumn') || msg.includes('does not exist') || msg.includes('psycopg')) {
          setError('DATABASE_ERROR:' + msg)
        } else {
          setError(msg || 'Failed to load contacts data.')
        }
      }
    } finally { setIsLoading(false) }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const filteredContacts = useMemo(() => {
    let filtered = [...contactsData]
    if (search) {
      filtered = filtered.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.emails?.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
        c.position?.toLowerCase().includes(search.toLowerCase()) ||
        c.role?.toLowerCase().includes(search.toLowerCase()) ||
        c.nasionality?.toLowerCase().includes(search.toLowerCase()) ||
        c.partners?.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
      )
    }
    filters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(c => {
          const fieldValue = filter.field === 'emails' ? c.emails?.join(', ') : c[filter.field as keyof Contact]
          return fieldValue && String(fieldValue).toLowerCase().includes(filter.value.toLowerCase())
        })
      }
    })
    return filtered
  }, [contactsData, search, filters])

  const paginatedContacts = useMemo(() => {
    if (itemsPerPage >= 99999) return filteredContacts
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredContacts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredContacts, currentPage, itemsPerPage])

  const totalPages = filteredContacts.length === 0
    ? 0
    : Math.max(1, Math.ceil(filteredContacts.length / (itemsPerPage >= 99999 ? filteredContacts.length : itemsPerPage)))

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return
    try {
      setIsDeleting(contactToDelete.id)
      const response = await axiosInstance.delete(`/api/contacts/${contactToDelete.id}`)
      if (response.data.code === 200) {
        await fetchContacts()
        setNotification({ isOpen: true, title: "Success", message: "Contact deleted successfully", type: "success" })
      } else throw new Error(response.data.message || 'Failed to delete contact')
    } catch (err: any) {
      setNotification({ isOpen: true, title: "Error", message: err.response?.data?.message || "Failed to delete contact", type: "error" })
    } finally { setIsDeleting(null); setContactToDelete(null) }
  }

  const addFilter = () => setFilters([...filters, { id: Date.now().toString(), field: fieldOptions[0].value, value: '' }])
  const removeFilter = (id: string) => setFilters(filters.filter(f => f.id !== id))
  const updateFilterField = (id: string, field: string) => setFilters(filters.map(f => f.id === id ? { ...f, field, value: '' } : f))
  const updateFilterValue = (id: string, value: string) => setFilters(filters.map(f => f.id === id ? { ...f, value } : f))
  const resetFilters = () => { setFilters([]); setSearch('') }

  const handleDownloadExcel = () => {
    const dataToExport = filteredContacts.map(contact => {
      const partner = contact.partners?.[0] ?? null
      return {
        ID: contact.id,
        Name: contact.name,
        'Email 1': contact.emails?.[0] || '-',
        'Email 2': contact.emails?.[1] || '-',
        'Phone 1': contact.phone_numbers?.[0] || '-',
        'Phone 2': contact.phone_numbers?.[1] || '-',
        Affiliation: partner?.name || '-',
        'Type of Affiliation': partner?.company_type || '-',
        Position: contact.position || '-',
        Country: contact.nasionality || '-',
        Category: partner?.partner_type || '-',
        Role: contact.role || '-',
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    
    const columnWidths = [
      { wch: 5 },   // ID
      { wch: 25 },  // Name
      { wch: 30 },  // Email 1
      { wch: 30 },  // Email 2
      { wch: 18 },  // Phone 1
      { wch: 18 },  // Phone 2
      { wch: 30 },  // Affiliation
      { wch: 20 },  // Type of Affiliation
      { wch: 40 },  // Position
      { wch: 20 },  // Country
      { wch: 15 },  // Category
      { wch: 20 },  // Role
    ]
    worksheet['!cols'] = columnWidths

    // Styling header dengan warna hijau
    const headerStyle = {
      fill: { fgColor: { rgb: "22C55E" } },
      font: { bold: true, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" }
    }
    
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1']
    headerCells.forEach(cell => {
      if (worksheet[cell]) {
        worksheet[cell].s = headerStyle
      }
    })

    filteredContacts.forEach((contact, index) => {
      const rowNum = index + 2 
      
      // Email 1
      if (contact.emails?.[0] && contact.emails[0] !== '-') {
        const cellC = `C${rowNum}`
        if (worksheet[cellC]) {
          worksheet[cellC].l = { Target: `mailto:${contact.emails[0]}` }
          worksheet[cellC].s = {
            font: { color: { rgb: "0563C1" }, underline: true }
          }
        }
      }
      
      // Email 2
      if (contact.emails?.[1] && contact.emails[1] !== '-') {
        const cellD = `D${rowNum}`
        if (worksheet[cellD]) {
          worksheet[cellD].l = { Target: `mailto:${contact.emails[1]}` }
          worksheet[cellD].s = {
            font: { color: { rgb: "0563C1" }, underline: true }
          }
        }
      }
    })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact List')
    XLSX.writeFile(workbook, `Contact_List_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (isLoading && contactsData.length === 0) return (
    <div>
      <div className="mb-6"><p className="text-sm text-slate-400">Bizdev / <span className="text-slate-600">Contact List</span></p><h1 className="text-2xl font-semibold mt-1 text-black">Contact List</h1></div>
      <div className="bg-white rounded-xl shadow-sm p-6"><div className="flex items-center justify-center py-12"><div className="text-center"><div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" /><p className="text-slate-600">Loading...</p></div></div></div>
    </div>
  )

  if (error && contactsData.length === 0) {
    const isDbError = error.startsWith('DATABASE_ERROR:')
    const cleanMsg = isDbError ? error.replace('DATABASE_ERROR:', '') : error
    return (
      <div>
        <div className="mb-6"><p className="text-sm text-slate-400">Bizdev / <span className="text-slate-600">Contact List</span></p><h1 className="text-2xl font-semibold mt-1 text-black">Contact List</h1></div>
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
            <button onClick={fetchContacts} className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition text-sm">Try Again</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleConfirmDelete} title="Delete Contact" message={`Are you sure you want to delete "${contactToDelete?.name}"?`} confirmText="Delete" cancelText="Cancel" type="reject" />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} title={notification.title} message={notification.message} type={notification.type} />

      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev / <span className="text-slate-600">Contact List</span></p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-2xl font-semibold mt-1 text-black">Contact List</h1>
          <div className="text-sm text-slate-500">Total: <span className="font-semibold text-slate-700">{pagination.total_items}</span> contacts</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowFilter(!showFilter)} className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-sky-600 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filter
              {filters.length > 0 && <span className="bg-white text-sky-500 rounded-full px-2 py-0.5 text-xs font-semibold">{filters.length}</span>}
            </button>
            <SearchBar value={search} onChange={setSearch} placeholder="Search name, email, company..." />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleDownloadExcel} disabled={filteredContacts.length === 0} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </button>
            <button onClick={fetchContacts} disabled={isLoading} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50 flex-1 sm:flex-none">
              <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
            <Link href="/bizdev/contact-list/add-contact" className="flex-1 sm:flex-none">
              <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition w-full">+ Add</button>
            </Link>
          </div>
        </div>

        <FilterPanel show={showFilter} filters={filters} onAddFilter={addFilter} onRemoveFilter={removeFilter} onUpdateField={updateFilterField} onUpdateValue={updateFilterValue} onResetAll={resetFilters} fieldOptions={fieldOptions} valueOptions={{ nasionality: UN_MEMBER_STATES.map(c => ({ label: c, value: c })) }} />

        <div className="mt-4">
          <ResponsiveTable<Contact>
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Name', accessor: 'name', isPrimary: true, cellClassName: 'font-medium' },
              {
                header: 'Email',
                render: (item) => item.emails && item.emails.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {item.emails.map((email, idx) => (
                      <a key={idx} href={`mailto:${email}`} className="text-sky-600 hover:underline text-sm" onClick={e => e.stopPropagation()}>{email}</a>
                    ))}
                  </div>
                ) : <span className="text-slate-400 text-xs">-</span>,
              },
              {
                header: 'Phone',
                render: (item) => item.phone_numbers && item.phone_numbers.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {item.phone_numbers.map((phone, idx) => (
                      <a key={idx} href={`tel:${phone}`} className="text-slate-700 hover:text-sky-600 text-sm" onClick={e => e.stopPropagation()}>{phone}</a>
                    ))}
                  </div>
                ) : <span className="text-slate-400 text-xs">-</span>,
              },
              {
                header: 'Company',
                render: (item) => item.company
                  ? <span className="text-sm font-medium text-slate-800">{item.company}</span>
                  : <span className="text-slate-400 text-xs">-</span>,
              },
              {
                header: 'Type of Affiliation',
                render: (item) => {
                  const partner = item.partners?.[0] ?? null
                  return partner
                    ? <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{partner.company_type}</span>
                    : <span className="text-slate-400 text-xs">-</span>
                },
              },
              {
                header: 'Position',
                render: (item) => item.position
                  ? <span className="text-sm text-slate-700">{item.position}</span>
                  : <span className="text-slate-400 text-xs">-</span>,
              },
              {
                header: 'Nasionality',
                render: (item) => item.nasionality
                  ? <span className="text-sm font-medium text-slate-800">{item.nasionality}</span>
                  : <span className="text-slate-400 text-xs">-</span>,
              },
              {
                header: 'Category',
                render: (item) => {
                  const partner = item.partners?.[0] ?? null
                  if (!partner) return <span className="text-slate-400 text-xs">-</span>
                  const colorMap: Record<string, string> = {
                    CLIENT: 'bg-green-100 text-green-700',
                    VENDOR: 'bg-orange-100 text-orange-700',
                    BOTH: 'bg-purple-100 text-purple-700',
                  }
                  const cls = colorMap[partner.partner_type] || 'bg-slate-100 text-slate-700'
                  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{partner.partner_type}</span>
                },
              },
              {
                header: 'Role',
                render: (item) => item.role
                  ? <span className="text-sm text-slate-700">{item.role}</span>
                  : <span className="text-slate-400 text-xs">-</span>,
              },
              {
                header: 'Action',
                render: (item) => (
                  <div className="flex gap-3">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/bizdev/contact-list/edit-contact?id=${item.id}`) }} className="text-sky-500 hover:text-sky-700 transition" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setContactToDelete({ id: item.id, name: item.name }); setShowDeleteModal(true) }} disabled={isDeleting === item.id} className="text-red-500 hover:text-red-700 transition disabled:opacity-50" title="Delete">
                      {isDeleting === item.id ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    </button>
                  </div>
                ),
              },
            ]}
            data={paginatedContacts}
            keyAccessor={(item) => item.id}
            showTopBorder={false}
            emptyState={search || filters.length > 0 ? <EmptyState type="search" /> : <EmptyState title="No contacts data available" description="Click '+ Add' to create a new contact" />}
          />
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredContacts.length} itemsPerPage={itemsPerPage} onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1) }} />
      </div>
    </div>
  )
}
