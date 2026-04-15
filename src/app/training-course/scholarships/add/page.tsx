"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

interface ScholarshipFormData {
  name: string
  date: string
  type: string
  category: string
  original_price: string
  discount: string
  price: string
}

const inputCls = "w-full h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm"
const selectCls = "w-full h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm bg-white"

export default function AddScholarshipPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error" | "info"
  }>({ isOpen: false, title: "", message: "", type: "success" })

  const [formData, setFormData] = useState<ScholarshipFormData>({
    name: "",
    date: "",
    type: "",
    category: "",
    original_price: "",
    discount: "",
    price: "",
  })

  const computedPrice = (originalPrice: string, discount: string): string => {
    const op = parseFloat(originalPrice) || 0
    const disc = parseFloat(discount) || 0
    const final = op - (op * disc) / 100
    return final > 0 ? final.toFixed(0) : "0"
  }

  const set = (field: keyof ScholarshipFormData, value: string) =>
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      if (field === "original_price" || field === "discount") {
        updated.price = computedPrice(
          field === "original_price" ? value : prev.original_price,
          field === "discount" ? value : prev.discount
        )
      }
      return updated
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const payload = {
        name: formData.name,
        date: formData.date,
        type: formData.type,
        category: formData.category,
        original_price: parseFloat(formData.original_price) || 0,
        discount: parseFloat(formData.discount) || 0,
      }
      const response = await axiosInstance.post("/api/scholarships/create", payload)
      if (response.data.code === 200 || response.data.code === 201) {
        setNotification({ isOpen: true, title: "Success", message: "Scholarship created successfully!", type: "success" })
        setTimeout(() => router.push("/training-course/scholarships"), 1500)
      } else {
        throw new Error(response.data.message || "Failed to create scholarship")
      }
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to create scholarship",
        type: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push("/training-course/scholarships")}
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
          Training Course / Scholarships / <span className="text-slate-600">Add</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add Scholarship</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-slate-700">Scholarship Information</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.name} onChange={e => set("name", e.target.value)} className={inputCls} required placeholder="e.g. Advanced Offshore Wind Turbines" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                  <input type="text" value={formData.date} onChange={e => set("date", e.target.value)} className={inputCls} placeholder="e.g. 12 Oct 2026 - 15 Oct 2026" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select value={formData.category} onChange={e => set("category", e.target.value)} className={selectCls}>
                    <option value="">Select Category</option>
                    <option value="Certification">Certification</option>
                    <option value="Training Course">Training Course</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select value={formData.type} onChange={e => set("type", e.target.value)} className={selectCls} required>
                    <option value="">Select Type</option>
                    <option value="Partial A">Partial A</option>
                    <option value="Partial B">Partial B</option>
                    <option value="Fully Funded">Fully Funded</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Original Price</label>
                    <input type="number" min="0" value={formData.original_price} onChange={e => set("original_price", e.target.value)} className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Discount (%)</label>
                    <input type="number" min="0" max="100" value={formData.discount} onChange={e => set("discount", e.target.value)} className={inputCls} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Final Price
                      <span className="ml-1 text-xs font-normal text-sky-500">(auto)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      readOnly
                      className="w-full h-10 px-4 border border-sky-200 rounded-lg text-sky-700 font-semibold bg-sky-50 text-sm cursor-default outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-5 border-t">
              <button type="button" onClick={() => setShowCancelModal(true)} className="px-6 py-2 text-sm bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2">
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
                ) : "Create Scholarship"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
