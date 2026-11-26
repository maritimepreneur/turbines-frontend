"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

interface FormData {
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string
  service: string
  goods: string
}

export default function AddPartnerPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    initials: "",
    industry: "",
    company_type: "",
    partner_type: "",
    service: "",
    goods: ""
  })

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      const response = await axiosInstance.post('/api/partners/create', formData)

      if (response.data.code === 200 || response.data.code === 201) {
        setNotification({
          isOpen: true,
          title: "Success",
          message: "Partner created successfully!",
          type: "success"
        })
        // Redirect after short delay
        setTimeout(() => {
          router.push("/bizdev/partner-list")
        }, 1500)
      } else {
        throw new Error(response.data.message || 'Failed to create partner')
      }
    } catch (err: any) {
      console.error('❌ Error creating partner:', err)
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to create partner",
        type: "error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setShowCancelModal(true)
  }

  const confirmCancel = () => {
    router.push('/bizdev/partner-list')
  }

  return (
    <div>
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Cancel Creation"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="No, Keep Editing"
        type="info"
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
          Bizdev / Partner List / <span className="text-slate-600">Add</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add Partner</h1>
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
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" required />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Initials <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.initials} onChange={(e) => handleInputChange("initials", e.target.value)} className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" required />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.industry} onChange={(e) => handleInputChange("industry", e.target.value)} className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" required />

                  <label className="text-xs font-semibold text-black block mb-1">Service</label>
                  <input type="text" value={formData.service} onChange={(e) => handleInputChange("service", e.target.value)} className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" placeholder="Optional" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Type <span className="text-red-500">*</span>
                  </label>
                  <select value={formData.company_type} onChange={(e) => handleInputChange("company_type", e.target.value)} className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" required>
                    <option value="">Select Company Type</option>
                    <option value="PRIVATE">Private</option>
                    <option value="PUBLIC">Public</option>
                    <option value="GOVERMENT">Government</option>
                    <option value="STATEOWNED">State Owned</option>
                    <option value="NONPROFIT">Nonprofit</option>
                    <option value="OTHER">Other</option>
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Partner Type <span className="text-red-500">*</span>
                  </label>
                  <select value={formData.partner_type} onChange={(e) => handleInputChange("partner_type", e.target.value)} className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" required>
                    <option value="">Select Partner Type</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="CLIENT">Client</option>
                    <option value="BOTH">Both</option>
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">Goods</label>
                  <input type="text" value={formData.goods} onChange={(e) => handleInputChange("goods", e.target.value)} className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" placeholder="Optional" />
                </div>
              </div>

              <div className="flex gap-3 mt-2 pt-4 border-t">
                <button type="button" onClick={handleCancel} className="px-6 py-2 text-sm bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>) : 'Create Partner'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── Section 2: Associated Contacts (info only on Add) ── */}
        <div className="bg-white rounded-xl shadow-sm text-black">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-slate-700">Associated Contacts</h2>
            <p className="text-xs text-slate-400 mt-0.5">Link contacts with this partner</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4 p-4 bg-sky-50 border border-sky-100 rounded-lg">
              <div className="shrink-0 w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm font-medium text-sky-800">Contact linking available after saving</p>
                <p className="text-xs text-sky-600 mt-1">
                  After creating this partner, open the <strong>Edit</strong> page to link existing contacts or create new contacts with this partner as their affiliation.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}