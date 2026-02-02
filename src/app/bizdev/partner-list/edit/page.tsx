"use client"

import { useState, useEffect } from "react"
import { usePartner, useUpdatePartner } from "@/hooks/usePartners"
import { useRouter, useSearchParams } from "next/navigation"

export default function EditPartnerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = parseInt(searchParams.get('id') || '0')
  
  const { data: partner, isLoading } = usePartner(id)
  const updatePartner = useUpdatePartner()
  
  const [formData, setFormData] = useState({
    name: "",
    initials: "",
    industry: "",
    company_type: "",
    partner_type: "",
    service: "",
    goods: ""
  })

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || "",
        initials: partner.initials || "",
        industry: partner.industry || "",
        company_type: partner.company_type || "",
        partner_type: partner.partner_type || "",
        service: partner.service || "",
        goods: partner.goods || ""
      })
    }
  }, [partner])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updatePartner.mutateAsync({ id, data: formData })
      router.push("/bizdev/partner-list")
    } catch (error) {
      console.error("Error updating partner:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev</p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Edit Partner</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        <form onSubmit={handleSubmit}>
          <div className="h-[calc(100vh-240px)] overflow-y-auto">
            <div className="p-6">
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
                    Partner Type
                  </label>
                  <select 
                    value={formData.partner_type}
                    onChange={(e) => handleInputChange("partner_type", e.target.value)}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                    required
                  >
                    <option value="">Select Partner Type</option>
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Supplier">Supplier</option>
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
                  disabled={updatePartner.isPending}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {updatePartner.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}