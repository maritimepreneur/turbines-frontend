"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

interface PartnerFormData {
  id: number; name: string; initials: string; industry: string
  company_type: string; partner_type: string; service: string; goods: string
}
interface PartnerResponse { message: string; code: number; data: PartnerFormData }

type Contact = {
  id: number; name: string; emails?: string[]; phone_numbers?: string[]
  partner_id?: number; position?: string; role?: string
}
interface ContactsResponse { message: string; code: number; data: { list: Contact[]; pagination: any } }

export default function EditPartnerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idStr = searchParams.get('id')
  const id = idStr ? parseInt(idStr) : 0

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<PartnerFormData>({
    id: 0, name: "", initials: "", industry: "",
    company_type: "", partner_type: "", service: "", goods: ""
  })

  // Contacts state
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [linkedContactIds, setLinkedContactIds] = useState<Set<number>>(new Set())
  const [contactSearch, setContactSearch] = useState("")
  const [isSavingContacts, setIsSavingContacts] = useState(false)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "info"
  }>({ isOpen: false, title: "", message: "", type: "success" })

  const isFetchingRef = useRef(false)

  useEffect(() => {
    if (!id || id <= 0) { router.push('/bizdev/partner-list'); return }
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    const fetchAll = async () => {
      try {
        setIsLoading(true); setError(null)

        const [partnerRes, contactsRes] = await Promise.all([
          axiosInstance.get<PartnerResponse>(`/api/partners/${id}`),
          axiosInstance.post<ContactsResponse>('/api/contacts/', { params: { page_size: 1000 } })
        ])

        if (partnerRes.data.code === 200) {
          const d = partnerRes.data.data
          setFormData({
            id: d.id, name: d.name || "", initials: d.initials || "",
            industry: d.industry || "", company_type: d.company_type?.toUpperCase() || "",
            partner_type: d.partner_type?.toUpperCase() || "", service: d.service || "", goods: d.goods || ""
          })
        } else throw new Error(partnerRes.data.message)

        if (contactsRes.data.code === 200) {
          const contacts = contactsRes.data.data.list
          setAllContacts(contacts)
          // Pre-select contacts already linked to this partner
          const linked = new Set(contacts.filter(c => c.partner_id === id).map(c => c.id))
          setLinkedContactIds(linked)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data')
        if (err.response?.status === 404) setTimeout(() => router.push('/bizdev/partner-list'), 3000)
      } finally { setIsLoading(false); isFetchingRef.current = false }
    }

    fetchAll()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const res = await axiosInstance.put(`/api/partners/${id}`, {
        name: formData.name, initials: formData.initials, industry: formData.industry,
        company_type: formData.company_type, partner_type: formData.partner_type,
        service: formData.service, goods: formData.goods
      })
      if (res.data.code === 200) {
        setNotification({ isOpen: true, title: "Success", message: "Partner updated successfully!", type: "success" })
        setTimeout(() => router.push("/bizdev/partner-list"), 1500)
      } else throw new Error(res.data.message)
    } catch (err: any) {
      setNotification({ isOpen: true, title: "Error", message: err.response?.data?.message || "Failed to update partner", type: "error" })
    } finally { setIsSaving(false) }
  }

  // Toggle link/unlink a contact
  const toggleContact = (contactId: number) => {
    setLinkedContactIds(prev => {
      const next = new Set(prev)
      if (next.has(contactId)) next.delete(contactId)
      else next.add(contactId)
      return next
    })
  }

  // Save contact associations: update partner_id of each contact
  const saveContactLinks = async () => {
    try {
      setIsSavingContacts(true)
      const promises = allContacts.map(contact => {
        const shouldLink = linkedContactIds.has(contact.id)
        const isLinked = contact.partner_id === id
        if (shouldLink && !isLinked) {
          // Link: update contact's partner_id to this partner
          return axiosInstance.put(`/api/contacts/${contact.id}`, { ...contact, partner_id: id })
        } else if (!shouldLink && isLinked) {
          // Unlink: clear contact's partner_id
          return axiosInstance.put(`/api/contacts/${contact.id}`, { ...contact, partner_id: null })
        }
        return Promise.resolve()
      })
      await Promise.all(promises)
      // Refresh contacts
      const res = await axiosInstance.post<ContactsResponse>('/api/contacts/', { params: { page_size: 1000 } })
      if (res.data.code === 200) {
        setAllContacts(res.data.data.list)
        setLinkedContactIds(new Set(res.data.data.list.filter(c => c.partner_id === id).map(c => c.id)))
      }
      setNotification({ isOpen: true, title: "Success", message: "Contact associations updated!", type: "success" })
    } catch {
      setNotification({ isOpen: true, title: "Error", message: "Failed to update contact associations", type: "error" })
    } finally { setIsSavingContacts(false) }
  }

  const filteredContacts = allContacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.emails?.[0]?.toLowerCase().includes(contactSearch.toLowerCase())
  )

  const inputCls = "w-full h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"

  if (isLoading) return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-slate-500">Loading partner data...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div><h3 className="font-semibold text-red-800">Error Loading Data</h3><p className="text-red-600 text-sm">{error}</p></div>
      </div>
      <button onClick={() => router.push('/bizdev/partner-list')} className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">Back to List</button>
    </div>
  )

  return (
    <div>
      <ConfirmationModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={() => router.push('/bizdev/partner-list')} title="Cancel Edit" message="Are you sure you want to cancel? All unsaved changes will be lost." confirmText="Yes, Cancel" cancelText="No, Keep Editing" type="info" />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} title={notification.title} message={notification.message} type={notification.type} />

      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev / Partner List / <span className="text-slate-600">Edit</span></p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Edit Partner</h1>
      </div>

      <div className="space-y-4">

        {/* ── Section 1: Partner Info ── */}
        <div className="bg-white rounded-xl shadow-sm text-black">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-slate-700">Partner Information</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-black block mb-1">Company Name <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className={inputCls} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black block mb-1">Company Initials <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.initials} onChange={e => setFormData(p => ({ ...p, initials: e.target.value }))} className={inputCls} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black block mb-1">Industry <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.industry} onChange={e => setFormData(p => ({ ...p, industry: e.target.value }))} className={inputCls} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black block mb-1">Service</label>
                    <input type="text" value={formData.service} onChange={e => setFormData(p => ({ ...p, service: e.target.value }))} className={inputCls} placeholder="Optional" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-black block mb-1">Company Type <span className="text-red-500">*</span></label>
                    <select value={formData.company_type} onChange={e => setFormData(p => ({ ...p, company_type: e.target.value }))} className={inputCls} required>
                      <option value="">Select Company Type</option>
                      <option value="PRIVATE">Private</option>
                      <option value="PUBLIC">Public</option>
                      <option value="GOVERNMENT">Government</option>
                      <option value="STATE_OWNED">State Owned</option>
                      <option value="NONPROFIT">Nonprofit</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black block mb-1">Partner Type <span className="text-red-500">*</span></label>
                    <select value={formData.partner_type} onChange={e => setFormData(p => ({ ...p, partner_type: e.target.value }))} className={inputCls} required>
                      <option value="">Select Partner Type</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="CLIENT">Client</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black block mb-1">Goods</label>
                    <input type="text" value={formData.goods} onChange={e => setFormData(p => ({ ...p, goods: e.target.value }))} className={inputCls} placeholder="Optional" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button type="button" onClick={() => setShowCancelModal(true)} className="px-6 py-2 text-sm bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</>) : 'Update Partner'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Section 2: Associated Contacts ── */}
        <div className="bg-white rounded-xl shadow-sm text-black">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-700">Associated Contacts</h2>
                <p className="text-xs text-slate-400 mt-0.5">Select contacts to link with this partner</p>
              </div>
              <span className="text-xs font-semibold bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
                {linkedContactIds.size} linked
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={contactSearch} onChange={e => setContactSearch(e.target.value)} placeholder="Search contacts by name or email..." className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" />
            </div>

            {/* Contact list */}
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">No contacts found</div>
              ) : filteredContacts.map(contact => {
                const isLinked = linkedContactIds.has(contact.id)
                return (
                  <label key={contact.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${isLinked ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                    <input
                      type="checkbox"
                      checked={isLinked}
                      onChange={() => toggleContact(contact.id)}
                      className="w-4 h-4 accent-sky-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{contact.name}</p>
                      <p className="text-xs text-slate-400 truncate">{contact.emails?.[0] || '—'}</p>
                    </div>
                    {contact.position && <span className="text-xs text-slate-500 shrink-0">{contact.position}</span>}
                    {isLinked && (
                      <span className="shrink-0 text-xs font-medium text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">Linked</span>
                    )}
                  </label>
                )
              })}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button type="button" onClick={saveContactLinks} disabled={isSavingContacts} className="px-5 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2">
                {isSavingContacts ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Save Contact Links</>)}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}