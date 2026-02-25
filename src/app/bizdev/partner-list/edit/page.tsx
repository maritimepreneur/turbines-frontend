"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

interface FormData {
  id: number
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string
  service: string
  goods: string
}

interface PartnerResponse {
  message: string
  code: number
  data: FormData
}

export default function EditPartnerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idStr = searchParams.get('id')
  const id = idStr ? parseInt(idStr) : 0

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    id: 0,
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

  // Avoid running effect if already fetching or if ID is missing/invalid
  const isFetchingRef = useRef(false)

  useEffect(() => {
    // Basic validation
    if (!id || id <= 0) {
      router.push('/bizdev/partner-list')
      return
    }

    if (isFetchingRef.current) return
    isFetchingRef.current = true

    const fetchPartnerData = async () => {
      try {
        setIsLoading(true)
        setError(null)


        const response = await axiosInstance.get<PartnerResponse>(`/api/partners/${id}`)

        if (response.data.code === 200) {
          const data = response.data.data
          setFormData({
            id: data.id,
            name: data.name || "",
            initials: data.initials || "",
            industry: data.industry || "",
            company_type: data.company_type?.toUpperCase() || "",
            partner_type: data.partner_type?.toUpperCase() || "",
            service: data.service || "",
            goods: data.goods || ""
          })
        } else {
          throw new Error(response.data.message || 'Failed to fetch partner data')
        }
      } catch (err: any) {
        console.error('❌ Error fetching partner:', err)
        setError(err.response?.data?.message || 'Failed to load partner data')

        if (err.response?.status === 404) {
          setTimeout(() => router.push('/bizdev/partner-list'), 3000)
        }
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
      }
    }

    fetchPartnerData()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      // Only send fields that match the API expectation 
      // Ensure dropdown values are uppercase as per API requirement usually
      const updateData = {
        name: formData.name,
        initials: formData.initials,
        industry: formData.industry,
        company_type: formData.company_type,
        partner_type: formData.partner_type,
        service: formData.service,
        goods: formData.goods
      }

      const response = await axiosInstance.put(`/api/partners/${id}`, updateData)

      if (response.data.code === 200) {
        console.log('✅ Partner updated successfully')
        setNotification({
          isOpen: true,
          title: "Success",
          message: "Partner updated successfully!",
          type: "success"
        })
        // Redirect after short delay
        setTimeout(() => {
          router.push("/bizdev/partner-list")
        }, 1500)
      } else {
        throw new Error(response.data.message || 'Failed to update partner')
      }
    } catch (err: any) {
      console.error('❌ Error updating partner:', err)
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to update partner",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-slate-500">Loading partner data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Data</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/bizdev/partner-list')}
          className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
        >
          Back to List
        </button>
      </div>
    )
  }

  return (
    <div>
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
        title="Cancel Edit"
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
          Bizdev / Partner List / <span className="text-slate-600">Edit</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Edit Partner</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-black block mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  required
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  Company Initials <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.initials}
                  onChange={(e) => handleInputChange("initials", e.target.value)}
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  required
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  Industry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleInputChange("industry", e.target.value)}
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  required
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  Service
                </label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => handleInputChange("service", e.target.value)}
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-black block mb-1">
                  Company Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => handleInputChange("company_type", e.target.value)}
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  required
                >
                  <option value="">Select Company Type</option>
                  <option value="PRIVATE">Private</option>
                  <option value="PUBLIC">Public</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="STATE_OWNED">State Owned</option>
                  <option value="NONPROFIT">Nonprofit</option>
                  <option value="OTHER">Other</option>
                </select>

                <label className="text-xs font-semibold text-black block mb-1">
                  Partner Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.partner_type}
                  onChange={(e) => handleInputChange("partner_type", e.target.value)}
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  required
                >
                  <option value="">Select Partner Type</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="CLIENT">Client</option>
                  <option value="BOTH">Both</option>
                </select>

                <label className="text-xs font-semibold text-black block mb-1">
                  Goods
                </label>
                <input
                  type="text"
                  value={formData.goods}
                  onChange={(e) => handleInputChange("goods", e.target.value)}
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Partner'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}