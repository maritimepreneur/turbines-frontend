"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

type Partner = { id: number; name: string; initials: string; industry: string; company_type: string; partner_type: string; service?: string | string[]; goods?: string | string[] }
type Contact = { id: number; name: string; company?: string; emails?: string[]; phone_numbers?: string[]; partner_id?: number | null; partners?: Partner[]; position?: string; role?: string }
interface ContactResponse { message: string; code: number; data: Contact }
interface PartnersResponse { message: string; code: number; data: { list: Partner[]; pagination: any } }

export default function EditContactPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = parseInt(searchParams.get('id') || '0')

    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [partners, setPartners] = useState<Partner[]>([])
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

    const [name, setName] = useState("")
    const [company, setCompany] = useState("")
    const [emails, setEmails] = useState<string[]>([""])
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""])
    const [partnerId, setPartnerId] = useState<string>("")
    const [position, setPosition] = useState("")
    const [role, setRole] = useState("")

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" | "info" }>({ isOpen: false, title: "", message: "", type: "success" })
    const [nameError, setNameError] = useState("")
    const [emailErrors, setEmailErrors] = useState<string[]>([""])
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) { router.push('/bizdev/contact-list'); return }

        // Fetch partners & contact in parallel
        Promise.all([
            axiosInstance.post<PartnersResponse>('/api/partners/', { page_size: 1000 }),
            axiosInstance.get<ContactResponse>(`/api/contacts/${id}`)
        ]).then(([partnerRes, contactRes]) => {
            // Partners
            if (partnerRes.data.code === 200) setPartners(partnerRes.data.data.list)

            // Contact
            if (contactRes.data.code === 200) {
                const c = contactRes.data.data
                setName(c.name || "")
                setCompany((c as any).company || "")
                setEmails(c.emails && c.emails.length > 0 ? c.emails : [""])
                setPhoneNumbers(c.phone_numbers && c.phone_numbers.length > 0 ? c.phone_numbers : [""])
                setPosition(c.position || "")
                setRole(c.role || "")
                const effectivePartnerId = c.partner_id ?? c.partners?.[0]?.id
                if (effectivePartnerId) {
                    setPartnerId(String(effectivePartnerId))
                    const found = partnerRes.data.data.list.find(p => p.id === effectivePartnerId)
                    setSelectedPartner(found || null)
                }
                setEmailErrors((c.emails && c.emails.length > 0 ? c.emails : [""]).map(() => ""))
            } else throw new Error(contactRes.data.message)
        }).catch((err: any) => {
            if (err.response?.status === 404) setFetchError('Contact not found')
            else if (err.response?.status === 401) { setFetchError('Session expired.'); router.push('/login') }
            else setFetchError(err.response?.data?.message || 'Failed to load data')
        }).finally(() => setIsFetching(false))
    }, [id, router])

    const handlePartnerChange = (pid: string) => {
        setPartnerId(pid)
        setSelectedPartner(pid ? (partners.find(p => p.id === parseInt(pid)) || null) : null)
    }

    const handleEmailChange = (idx: number, value: string) => { setEmails(prev => prev.map((e, i) => i === idx ? value : e)); setEmailErrors(prev => prev.map((e, i) => i === idx ? "" : e)) }
    const addEmail = () => { setEmails(prev => [...prev, ""]); setEmailErrors(prev => [...prev, ""]) }
    const removeEmail = (idx: number) => { setEmails(prev => prev.filter((_, i) => i !== idx)); setEmailErrors(prev => prev.filter((_, i) => i !== idx)) }
    const handlePhoneChange = (idx: number, value: string) => setPhoneNumbers(prev => prev.map((p, i) => i === idx ? value : p))
    const addPhone = () => setPhoneNumbers(prev => [...prev, ""])
    const removePhone = (idx: number) => setPhoneNumbers(prev => prev.filter((_, i) => i !== idx))

    const validate = () => {
        let valid = true
        if (!name.trim()) { setNameError("Contact name is required"); valid = false } else setNameError("")
        const errs = emails.map((e, i) => { if (i === 0 && !e.trim()) return "At least one email is required"; if (e.trim() && (!e.includes('@') || !e.includes('.'))) return "Invalid email format"; return "" })
        setEmailErrors(errs); if (errs.some(e => e)) valid = false
        return valid
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault(); if (!validate()) return
        try {
            setIsLoading(true); setSubmitError(null)

            const parsedPartnerId = partnerId ? parseInt(partnerId) : null
            const fullPayload = {
                name: name.trim(),
                company: company.trim() || selectedPartner?.name || "-",
                emails: emails.filter(e => e.trim()),
                phone_numbers: phoneNumbers.filter(p => p.trim()).map(p => p.trim().replace(/[^\d+]/g, '')),
                partner_id: parsedPartnerId,
                partner_ids: parsedPartnerId ? [parsedPartnerId] : [],
                position: position.trim() || null,
                role: role.trim() || null,
            }

            const res = await axiosInstance.put(`/api/contacts/${id}`, fullPayload)
            if (res.data.code === 200 || res.data.code === 201) {
                setNotification({ isOpen: true, title: "Success", message: "Contact updated successfully!", type: "success" })
                setTimeout(() => router.push("/bizdev/contact-list"), 1500)
            } else throw new Error(res.data.message || 'Failed to update contact')
        } catch (err: any) {
            const status = err.response?.status
            const backendMsg: string = err.response?.data?.message || err.response?.data?.detail || err.message || ''

            // Fallback: try minimal payload if 500
            if (status === 500) {
                try {
                    const minimalPayload = {
                        name: name.trim(),
                        emails: emails.filter(e => e.trim()),
                        phone_numbers: phoneNumbers.filter(p => p.trim()).map(p => p.trim().replace(/[^\d+]/g, '')),
                    }
                    const fallbackRes = await axiosInstance.put(`/api/contacts/${id}`, minimalPayload)
                    if (fallbackRes.data.code === 200 || fallbackRes.data.code === 201) {
                        setNotification({ isOpen: true, title: "Partial Success", message: "Contact updated, but some fields (partner/position/role) may not be supported by the backend yet.", type: "info" })
                        setTimeout(() => router.push("/bizdev/contact-list"), 2000)
                        return
                    }
                } catch { /* fallback also failed */ }
            }

            const displayMsg = status === 500
                ? `Server Error (500): ${backendMsg || 'Internal server error — the backend may not support all fields yet.'}`
                : backendMsg || 'Failed to update contact.'

            setSubmitError(displayMsg)
            setNotification({ isOpen: true, title: "Error", message: displayMsg.slice(0, 120), type: "error" })
        } finally { setIsLoading(false) }
    }

    const inputCls = "w-full h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
    const trashIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    const plusIcon = <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>

    if (isFetching) return (
        <div><div className="mb-6"><p className="text-sm text-slate-400">Bizdev / Contact List / <span className="text-slate-600">Edit</span></p><h1 className="text-2xl font-semibold mt-1 text-black">Edit Contact</h1></div>
            <div className="bg-white rounded-xl shadow-sm p-6"><div className="flex items-center justify-center py-12"><div className="text-center"><div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4" /><p className="text-slate-600">Loading...</p></div></div></div></div>
    )

    if (fetchError) return (
        <div><div className="mb-6"><p className="text-sm text-slate-400">Bizdev / Contact List / <span className="text-slate-600">Edit</span></p><h1 className="text-2xl font-semibold mt-1 text-black">Edit Contact</h1></div>
            <div className="bg-white rounded-xl shadow-sm p-6"><div className="flex flex-col items-center justify-center py-12"><h3 className="text-lg font-semibold mb-2">Failed to Load</h3><p className="text-slate-600 mb-4">{fetchError}</p><button onClick={() => router.back()} className="bg-sky-500 text-white px-6 py-2 rounded-lg">Go Back</button></div></div></div>
    )

    return (
        <div>
            <ConfirmationModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={() => router.push("/bizdev/contact-list")} title="Cancel Edit" message="Are you sure you want to cancel? All unsaved changes will be lost." confirmText="Yes, Cancel" cancelText="No, Keep Editing" type="info" />
            <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} title={notification.title} message={notification.message} type={notification.type} />

            <div className="mb-6">
                <p className="text-sm text-slate-400">Bizdev / Contact List / <span className="text-slate-600">Edit</span></p>
                <h1 className="text-2xl font-semibold mt-1 text-black">Edit Contact</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Section 1: Contact Info ── */}
                <div className="bg-white rounded-xl shadow-sm text-black">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-slate-700">Contact Information</h2>
                    </div>
                    <div className="p-4 sm:p-6 space-y-5">
                        {submitError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <div><h3 className="text-sm font-semibold text-red-800">Error</h3><p className="text-xs text-red-600 mt-1">{submitError}</p></div>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="text-xs font-semibold text-black block mb-1">Contact Name <span className="text-red-500">*</span></label>
                            <input type="text" value={name} onChange={e => { setName(e.target.value); setNameError("") }} placeholder="Person in charge" className={`${inputCls} ${nameError ? "border-red-500" : ""}`} />
                            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                        </div>

                        {/* Company */}
                        <div>
                            <label className="text-xs font-semibold text-black block mb-1">Company</label>
                            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. PT Mahakarya Maritim Muda Nusantara" className={inputCls} />
                            <p className="text-xs text-slate-400 mt-1">Direct company name (optional, separate from partner affiliation)</p>
                        </div>

                        {/* Emails */}
                        <div>
                            <label className="text-xs font-semibold text-black block mb-2">Email <span className="text-red-500">*</span></label>
                            <div className="space-y-2">
                                {emails.map((email, idx) => (
                                    <div key={idx}>
                                        <div className="flex items-center gap-2">
                                            <input type="email" value={email} onChange={e => handleEmailChange(idx, e.target.value)} placeholder={`example${idx > 0 ? idx + 1 : ""}@email.com`} className={`flex-1 h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${emailErrors[idx] ? "border-red-500" : "border-gray-300"}`} />
                                            {emails.length > 1 && <button type="button" onClick={() => removeEmail(idx)} className="shrink-0 h-10 w-10 flex items-center justify-center border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">{trashIcon}</button>}
                                        </div>
                                        {emailErrors[idx] && <p className="text-xs text-red-500 mt-1">{emailErrors[idx]}</p>}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addEmail} className="mt-2 flex items-center gap-2 px-4 py-2 text-sm text-sky-600 border border-sky-200 bg-sky-50 hover:bg-sky-100 rounded-lg transition font-medium">{plusIcon} Add Another Email</button>
                        </div>

                        {/* Phones */}
                        <div>
                            <label className="text-xs font-semibold text-black block mb-2">Phone Number</label>
                            <div className="space-y-2">
                                {phoneNumbers.map((phone, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input type="tel" value={phone} onChange={e => handlePhoneChange(idx, e.target.value)} placeholder="+62 xxx xxxx xxxx" className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" />
                                        {phoneNumbers.length > 1 && <button type="button" onClick={() => removePhone(idx)} className="shrink-0 h-10 w-10 flex items-center justify-center border border-red-200 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">{trashIcon}</button>}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addPhone} className="mt-2 flex items-center gap-2 px-4 py-2 text-sm text-sky-600 border border-sky-200 bg-sky-50 hover:bg-sky-100 rounded-lg transition font-medium">{plusIcon} Add Another Phone</button>
                        </div>

                        {/* Position & Role */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">Position</label>
                                <input type="text" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Manager" className={inputCls} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">Role</label>
                                <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Decision Maker" className={inputCls} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Affiliation ── */}
                <div className="bg-white rounded-xl shadow-sm text-black">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-slate-700">Affiliation</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Link this contact to a partner company</p>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-black block mb-1">Partner Company</label>
                            <select value={partnerId} onChange={e => handlePartnerChange(e.target.value)} className={inputCls}>
                                <option value="">— No affiliation —</option>
                                {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.initials})</option>)}
                            </select>
                        </div>

                        {selectedPartner && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-4">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Partner Details</p>

                                {/* Row 1: ID + Name + Initials */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Partner ID</p>
                                        <p className="text-sm font-mono font-medium text-slate-800">#{selectedPartner.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Company Name</p>
                                        <p className="text-sm font-medium text-slate-800">{selectedPartner.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Initials</p>
                                        <span className="inline-block px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700 text-sm font-mono">{selectedPartner.initials}</span>
                                    </div>
                                </div>

                                {/* Row 2: Industry + Company Type + Partner Type */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Type of Industry</p>
                                        <p className="text-sm text-slate-700">{selectedPartner.industry || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Company Type</p>
                                        <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-medium">{selectedPartner.company_type || '—'}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Partner Type</p>
                                        {(() => {
                                            const colorMap: Record<string, string> = { CLIENT: 'bg-green-100 text-green-700', VENDOR: 'bg-orange-100 text-orange-700', BOTH: 'bg-purple-100 text-purple-700' }
                                            const cls = colorMap[selectedPartner.partner_type?.toUpperCase()] || 'bg-slate-100 text-slate-700'
                                            return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{selectedPartner.partner_type || '—'}</span>
                                        })()}
                                    </div>
                                </div>

                                {/* Row 3: Service + Goods */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Service</p>
                                        <p className="text-sm text-slate-700">{Array.isArray(selectedPartner.service) ? (selectedPartner.service.length > 0 ? selectedPartner.service.join(', ') : <span className="text-slate-400 italic">—</span>) : (selectedPartner.service || <span className="text-slate-400 italic">—</span>)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-0.5">Goods</p>
                                        <p className="text-sm text-slate-700">{Array.isArray(selectedPartner.goods) ? (selectedPartner.goods.length > 0 ? selectedPartner.goods.join(', ') : <span className="text-slate-400 italic">—</span>) : (selectedPartner.goods || <span className="text-slate-400 italic">—</span>)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Action Buttons ── */}
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setShowCancelModal(true)} disabled={isLoading} className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-50 flex items-center gap-2">
                        {isLoading ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Updating...</span></>) : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span>Update</span></>)}
                    </button>
                </div>
            </form>
        </div>
    )
}
