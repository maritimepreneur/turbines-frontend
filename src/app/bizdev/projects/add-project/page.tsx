"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

export default function AddProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [contacts, setContacts] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cRes, pRes, iRes, lRes] = await Promise.all([
          axiosInstance.get('/api/contacts/').catch(() => ({ data: [] })),
          axiosInstance.get('/api/partners/').catch(() => ({ data: [] })),
          axiosInstance.get('/api/invoices/').catch(() => ({ data: [] })),
          axiosInstance.get('/api/leads/').catch(() => ({ data: [] }))
        ])

        const getArray = (res: any) => Array.isArray(res.data) ? res.data : res.data?.data?.list || res.data?.data || []
        
        setContacts(getArray(cRes))
        setPartners(getArray(pRes))
        setInvoices(getArray(iRes))
        setLeads(getArray(lRes))
      } catch (err) {
        console.error("Failed to fetch options", err)
      }
    }
    fetchOptions()
  }, [])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  
  const [location, setLocation] = useState("")
  const [type, setType] = useState("")
  const [duration, setDuration] = useState("")
  const [paymentType, setPaymentType] = useState("")
  const [currentStages, setCurrentStages] = useState("")
  
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [contactId, setContactId] = useState("")
  const [partnerId, setPartnerId] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [leadId, setLeadId] = useState("")

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "info" }>({ isOpen: false, title: "", message: "", type: "success" })
  
  const [nameError, setNameError] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validate = () => {
    let valid = true
    if (!name.trim()) { setNameError("Project name is required"); valid = false } else setNameError("")
    return valid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!validate()) return
    try {
      setIsLoading(true); setSubmitError(null)

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        type: type.trim() || undefined,
        duration: duration.trim() || undefined,
        payment_type: paymentType.trim() || undefined,
        current_stages: currentStages.trim() || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        ...(contactId ? { contact_id: parseInt(contactId) } : {}),
        ...(partnerId ? { partner_id: parseInt(partnerId) } : {}),
        ...(invoiceId ? { invoice_id: parseInt(invoiceId) } : {}),
        ...(leadId ? { lead_id: parseInt(leadId) } : {}),
      }

      // adjust endpoint if necessary
      const res = await axiosInstance.post('/api/projects/create', payload)

      if (res.data.code === 200 || res.data.code === 201) {
        setNotification({ isOpen: true, title: "Success", message: "Project created successfully!", type: "success" })
        setTimeout(() => router.push("/bizdev/projects"), 1500)
      } else throw new Error(res.data.message || 'Failed to create project')
    } catch (err: any) {
      const backendMsg: string = err.response?.data?.message || err.response?.data?.detail || err.message || ''
      const displayMsg = backendMsg || 'Failed to create project.'
      setSubmitError(displayMsg)
      setNotification({ isOpen: true, title: "Error", message: displayMsg.slice(0, 200), type: "error" })
    } finally { setIsLoading(false) }
  }

  const inputCls = "w-full h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"

  return (
    <div>
      <ConfirmationModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={() => router.push("/bizdev/projects")} title="Cancel Creation" message="Are you sure you want to cancel? All unsaved changes will be lost." confirmText="Yes, Cancel" cancelText="No, Keep Editing" type="info" />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} title={notification.title} message={notification.message} type={notification.type} />

      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev / Projects / <span className="text-slate-600">Add</span></p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Section 1: General Info */}
        <div className="bg-white rounded-xl shadow-sm text-black">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-slate-700">General Information</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-5">
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div><h3 className="text-sm font-semibold text-red-800">Error</h3><p className="text-xs text-red-600 mt-1">{submitError}</p></div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-semibold text-black block mb-1">Project Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); setNameError("") }} placeholder="e.g. Website Turbines" className={`${inputCls} ${nameError ? "border-red-500" : ""}`} />
                {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-black block mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Project description..." className={`${inputCls} h-24 py-2 resize-none`} />
            </div>
          </div>
        </div>

        {/* Section 2: Details */}
        <div className="bg-white rounded-xl shadow-sm text-black">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-slate-700">Project Details</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-black block mb-1">Location</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Jakarta" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-black block mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                  <option value="">Select Type</option>
                  <option value="Other">Other</option>
                  <option value="BECdex Certification">BECdex Certification</option>
                  <option value="CBEc Training Course">CBEc Training Course</option>
                  <option value="Maritime Professional">Maritime Professional</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-black block mb-1">Duration</label>
                <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 6 Months" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-black block mb-1">Payment Type</label>
                <select value={paymentType} onChange={e => setPaymentType(e.target.value)} className={inputCls}>
                  <option value="">Select Payment Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Cashless">Cashless</option>
                  <option value="Digital/Electronic">Digital/Electronic</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-black block mb-1">Current Stages</label>
                <select value={currentStages} onChange={e => setCurrentStages(e.target.value)} className={inputCls}>
                  <option value="">Select Stage</option>
                  <option value="Concept">Concept</option>
                  <option value="Planning">Planning</option>
                  <option value="Execution">Execution</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Closing">Closing</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Timeline & References */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm text-black">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-700">Timeline</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-black block mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-black block mb-1">End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm text-black">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-700">References</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">Contact</label>
                  <select value={contactId} onChange={e => setContactId(e.target.value)} className={inputCls}>
                    <option value="">Select Contact</option>
                    {contacts.map(c => <option key={c.id} value={c.id}>{c.name || `Contact ${c.id}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">Partner</label>
                  <select value={partnerId} onChange={e => setPartnerId(e.target.value)} className={inputCls}>
                    <option value="">Select Partner</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name || `Partner ${p.id}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">Invoice</label>
                  <select value={invoiceId} onChange={e => setInvoiceId(e.target.value)} className={inputCls}>
                    <option value="">Select Invoice</option>
                    {invoices.map(i => <option key={i.id} value={i.id}>{i.number || `Invoice ${i.id}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">Lead</label>
                  <select value={leadId} onChange={e => setLeadId(e.target.value)} className={inputCls}>
                    <option value="">Select Lead</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name || `Lead ${l.id}`}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => setShowCancelModal(true)} disabled={isLoading} className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2">
            {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>Submit</span></>)}
          </button>
        </div>
      </form>
    </div>
  )
}
