"use client"

import { useState, useEffect } from "react"
import { useVendor, useUpdateVendor } from "@/hooks/useVendors"
import { useRouter, useSearchParams } from "next/navigation"

export default function EditVendorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = parseInt(searchParams.get('id') || '0')

  const { data: vendor, isLoading } = useVendor(id)
  const updateVendor = useUpdateVendor()

  const [formData, setFormData] = useState({
    name: "",
    initials: "",
    industry: "",
    company_type: "",
    vendor_type: "",
    service: "",
    goods: ""
  })

  // Normalise string | string[] → plain string for the form inputs
  const toStr = (v?: string | string[]) =>
    Array.isArray(v) ? v.join(", ") : (v ?? "")

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || "",
        initials: vendor.initials || "",
        industry: vendor.industry || "",
        company_type: vendor.company_type || "",
        vendor_type: vendor.vendor_type || "",
        service: toStr(vendor.service),
        goods: toStr(vendor.goods),
      })
    }
  }, [vendor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateVendor.mutateAsync({ id, data: formData })
      router.push("/bizdev/vendor-list")
    } catch (error) {
      console.error("Error updating vendor:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev / <span className="text-slate-600">Vendor List</span></p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Edit Vendor</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        <form onSubmit={handleSubmit}>
          <div className="max-h-none sm:max-h-[calc(100vh-240px)] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    required
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Initials
                  </label>
                  <input
                    type="text"
                    value={formData.initials}
                    onChange={(e) => handleInputChange("initials", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    required
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    required
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Service
                  </label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => handleInputChange("service", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Type
                  </label>
                  <select
                    value={formData.company_type}
                    onChange={(e) => handleInputChange("company_type", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    required
                  >
                    <option value="">Select Company Type</option>
                    <option value="Private">Private</option>
                    <option value="Public">Public</option>
                    <option value="Government">Government</option>
                    <option value="Non-Profit">Non-Profit</option>
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Vendor Type
                  </label>
                  <select
                    value={formData.vendor_type}
                    onChange={(e) => handleInputChange("vendor_type", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    required
                  >
                    <option value="">Select Vendor Type</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Service Provider">Service Provider</option>
                    <option value="Contractor">Contractor</option>
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Goods
                  </label>
                  <input
                    type="text"
                    value={formData.goods}
                    onChange={(e) => handleInputChange("goods", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateVendor.isPending}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {updateVendor.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
