"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

export default function EditScholarshipPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idStr = searchParams.get("id")
  const id = idStr ? parseInt(idStr) : 0

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  const isFetchingRef = useRef(false)

  useEffect(() => {
    if (!id || id <= 0) { router.push("/training-course/scholarships"); return }
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    const normalizeType = (val: string): string => {
      const t = val?.toLowerCase().trim() || ""
      if (t.includes("partial") && (t.includes(" a") || t.endsWith("a"))) return "Partial A"
      if (t.includes("partial") && (t.includes(" b") || t.endsWith("b"))) return "Partial B"
      if (t.includes("full")) return "Fully Funded"
      return val || ""
    }

    const fetchData = async () => {
      try {
        setIsLoading(true); setError(null)
        const response = await axiosInstance.get(`/api/scholarships/${id}`)
        const d = response.data?.data || response.data
        if (d) {
          setFormData({
            name: d.name || "",
            date: d.date || "",
            type: normalizeType(d.type),
            category: d.category || "",
            original_price: d.original_price?.toString() || "",
            discount: d.discount?.toString() || "",
            price: d.price?.toString() || "",
          })
        } else {
          throw new Error("Failed to load scholarship data")
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load data")
        if (err.response?.status === 404) setTimeout(() => router.push("/training-course/scholarships"), 3000)
      } finally { setIsLoading(false); isFetchingRef.current = false }
    }

    fetchData()
  }, [id, router])

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
      const res = await axiosInstance.put(`/api/scholarships/update/${id}`, payload)
      if (res.data.code === 200 || res.data.code === 201) {
        setNotification({ isOpen: true, title: "Success", message: "Scholarship updated successfully!", type: "success" })
        setTimeout(() => router.push("/training-course/scholarships"), 1500)
      } else throw new Error(res.data.message)
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to update scholarship",
        type: "error",
      })
    } finally { setIsSaving(false) }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
        <p className="text-slate-500">Loading scholarship data...</p>
      </div>
    </div>
  )

  if (error) return (
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
      <button onClick={() => router.push("/training-course/scholarships")} className="mt-4 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm">
        ← Back to List
      </button>
    </div>
  )

  return (
    <div>
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => router.push("/training-course/scholarships")}
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
          Training Course / Scholarships / <span className="text-slate-600">Edit</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Edit Scholarship</h1>
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
                  <input type="text" value={formData.name} onChange={e => set("name", e.target.value)} className={inputCls} required />
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
              <button type="submit" disabled={isSaving} className="px-6 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-50 flex items-center gap-2">
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</>
                ) : "Update Scholarship"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
