"use client"

import { useState } from "react"
import { useCreateVendor } from "@/hooks/useVendors"
import { useRouter } from "next/navigation"

const COMPANY_TYPES = ["PT", "CV", "UD", "Firma", "Koperasi", "Other"]

export default function AddVendorPage() {
  const router = useRouter()
  const createVendor = useCreateVendor()

  const [formData, setFormData] = useState({
    name: "",
    initials: "",
    industry: "",
    company_type: "",
    // service & goods sebagai string input, di-convert ke array saat submit
    service: "",
    goods: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createVendor.mutateAsync({
        name: formData.name,
        initials: formData.initials,
        industry: formData.industry,
        company_type: formData.company_type,
        // Split by comma, trim whitespace, filter empty strings → array
        service: formData.service
          ? formData.service.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        goods: formData.goods
          ? formData.goods.split(",").map((g) => g.trim()).filter(Boolean)
          : [],
      })
      router.push("/bizdev/vendor-list")
    } catch (error) {
      console.error("Error creating vendor:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Vendor List</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add Vendor</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        <form onSubmit={handleSubmit}>
          <div className="max-h-none sm:max-h-[calc(100vh-240px)] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ── Left column ── */}
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Initials <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.initials}
                    onChange={(e) => handleInputChange("initials", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                {/* ── Right column ── */}
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.company_type}
                    onChange={(e) => handleInputChange("company_type", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="">Select Company Type</option>
                    {COMPANY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Service
                    <span className="text-slate-400 font-normal ml-1">(pisahkan dengan koma)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => handleInputChange("service", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g. Consulting, Maintenance"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Goods
                    <span className="text-slate-400 font-normal ml-1">(pisahkan dengan koma)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.goods}
                    onChange={(e) => handleInputChange("goods", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g. Spare Parts, Equipment"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVendor.isPending}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                >
                  {createVendor.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
