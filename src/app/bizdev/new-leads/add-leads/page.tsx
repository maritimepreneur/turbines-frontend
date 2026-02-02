"use client"
import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"

interface FormData {
  // Lead info
  name: string
  period: string
  description: string
  
  // Contact info
  contact_name: string
  contact_email: string
  contact_phone: string
  contact_company: string
  
  // Partner info
  partner_name: string
  partner_initials: string
  partner_industry: string
  partner_company_type: string
  partner_type: string
  partner_service: string
  partner_goods: string
}

export default function AddLeadsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    period: "",
    description: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_company: "",
    partner_name: "",
    partner_initials: "",
    partner_industry: "",
    partner_company_type: "",
    partner_type: "",
    partner_service: "",
    partner_goods: "",
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.period) {
      newErrors.period = "Period is required"
    }

    // Validate contact if any field is filled
    const contactFilled = formData.contact_name || formData.contact_email || formData.contact_phone
    if (contactFilled) {
      if (!formData.contact_name.trim()) {
        newErrors.contact_name = "Contact name is required"
      }
      if (!formData.contact_email.trim()) {
        newErrors.contact_email = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
        newErrors.contact_email = "Invalid email format"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      console.log("❌ Form validation failed")
      return
    }

    try {
      setIsLoading(true)
      setSubmitError(null)
      console.log("📤 Submitting lead data...", formData)

      let contactId = null
      let partnerId = null

      // 1. Create Contact if filled
      if (formData.contact_name) {
        const contactData = {
          name: formData.contact_name,
          emails: formData.contact_email ? [formData.contact_email] : [],
          phone_numbers: formData.contact_phone ? [formData.contact_phone] : [],
          company: formData.contact_company,
        }
        
        console.log("📤 Creating contact...", contactData)
        const contactRes = await axiosInstance.post('/api/contacts/create', contactData)
        contactId = contactRes.data.data?.id
        console.log("✅ Contact created:", contactId)
      }

      // 2. Create Partner if filled
      if (formData.partner_name) {
        const partnerData = {
          name: formData.partner_name,
          initials: formData.partner_initials,
          industry: formData.partner_industry,
          company_type: formData.partner_company_type,
          partner_type: formData.partner_type,
          service: formData.partner_service,
          goods: formData.partner_goods,
        }
        
        console.log("📤 Creating partner...", partnerData)
        const partnerRes = await axiosInstance.post('/api/partners/create', partnerData)
        partnerId = partnerRes.data.data?.id
        console.log("✅ Partner created:", partnerId)
      }

      // 3. Create Lead
      const leadData: any = {
        name: formData.name,
        period: formData.period,
        description: formData.description,
      }

      if (contactId) leadData.contact_id = contactId
      if (partnerId) leadData.partner_id = partnerId

      console.log("📤 Creating lead...", leadData)
      const leadRes = await axiosInstance.post('/api/leads/create', leadData)

      if (leadRes.data.code === 200 || leadRes.data.code === 201) {
        console.log("✅ Lead created successfully!")
        alert("Lead created successfully!")
        router.push("/bizdev/new-leads")
      } else {
        throw new Error(leadRes.data.message || 'Failed to create lead')
      }
      
    } catch (err: any) {
      console.error("❌ Failed to create lead:", err)
      setSubmitError(err.response?.data?.message || err.message || "Failed to create lead. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
      router.push("/bizdev/new-leads")
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">Bizdev</p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add New Lead</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        {/* Submit Error Alert */}
        {submitError && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-xs text-red-600 mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="h-[calc(100vh-240px)] overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter lead name"
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mb-3">{errors.name}</p>
                  )}
                  {!errors.name && <div className="mb-3"></div>}

                  <label className="text-xs font-semibold text-black block mb-1">
                    Period <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${
                      errors.period ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.period && (
                    <p className="text-xs text-red-500 mb-3">{errors.period}</p>
                  )}
                  {!errors.period && <div className="mb-3"></div>}

                  <label className="text-xs font-semibold text-black block mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter description..."
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-vertical"
                  />
                </div>

                {/* Right Column - Contact Info */}
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    placeholder="Person in charge"
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${
                      errors.contact_name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.contact_name && (
                    <p className="text-xs text-red-500 mb-3">{errors.contact_name}</p>
                  )}
                  {!errors.contact_name && <div className="mb-3"></div>}

                  <label className="text-xs font-semibold text-black block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${
                      errors.contact_email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.contact_email && (
                    <p className="text-xs text-red-500 mb-3">{errors.contact_email}</p>
                  )}
                  {!errors.contact_email && <div className="mb-3"></div>}

                  <label className="text-xs font-semibold text-black block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="+62 xxx xxxx xxxx"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="contact_company"
                    value={formData.contact_company}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Partner Details Section */}
              <h2 className="text-lg font-bold mb-4 mt-2">Detail Partner</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    name="partner_name"
                    value={formData.partner_name}
                    onChange={handleChange}
                    placeholder="Enter partner name"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Initials
                  </label>
                  <input
                    type="text"
                    name="partner_initials"
                    value={formData.partner_initials}
                    onChange={handleChange}
                    placeholder="e.g., PTM"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="partner_industry"
                    value={formData.partner_industry}
                    onChange={handleChange}
                    placeholder="e.g., Manufacturing, Technology"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Service
                  </label>
                  <input
                    type="text"
                    name="partner_service"
                    value={formData.partner_service}
                    onChange={handleChange}
                    placeholder="e.g., System Integration"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Company Type
                  </label>
                  <select
                    name="partner_company_type"
                    value={formData.partner_company_type}
                    onChange={handleChange}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  >
                    <option value="">Select Company Type</option>
                    <option value="PRIVATE">Private</option>
                    <option value="PUBLIC">Public</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="STATE_OWNED">State Owned</option>
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Partner Type
                  </label>
                  <select
                    name="partner_type"
                    value={formData.partner_type}
                    onChange={handleChange}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  >
                    <option value="">Select Partner Type</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="CLIENT">Client</option>
                    <option value="SUPPLIER">Supplier</option>
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Goods
                  </label>
                  <input
                    type="text"
                    name="partner_goods"
                    value={formData.partner_goods}
                    onChange={handleChange}
                    placeholder="e.g., Networking Device"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}