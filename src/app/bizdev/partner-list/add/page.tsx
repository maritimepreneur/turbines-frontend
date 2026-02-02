"use client"

import { useState } from "react"
import { useCreatePartner } from "@/hooks/usePartners"
import { useRouter } from "next/navigation"

export default function AddPartnerPage() {
  const router = useRouter()
  const createPartner = useCreatePartner()
  const [formData, setFormData] = useState({
    name: "",
    initials: "",
    industry: "",
    company_type: "",
    partner_type: "",
    service: "",
    goods: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createPartner.mutateAsync(formData)
      router.push("/bizdev/partner-list")
    } catch (error) {
      console.error("Error creating partner:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev</p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add Partner</h1>
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
                  disabled={createPartner.isPending}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {createPartner.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}