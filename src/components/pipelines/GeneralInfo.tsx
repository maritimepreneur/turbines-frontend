'use client'

import { useState, useEffect } from 'react'
import axiosInstance from '@/lib/axios'
import { NotificationModal } from "@/components/modals/NotificationModal"

interface Lead {
  id: number
  name: string
  period: string
  description: string
  contact_id: number | null
  partner_id: number | null
  current_stages: string
  contact_name: string | null
  company: string | null
  partner_name: string
}

interface GeneralInfoProps {
  lead?: Lead | null
}

export default function GeneralInfo({ lead }: GeneralInfoProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Notification state
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

  // State for editable fields
  const [formData, setFormData] = useState({
    // Partner fields
    partner_name: '',
    partner_initials: '',
    partner_type: '',
    partner_industry: '',
    partner_company_type: '',
    partner_service: '',
    partner_goods: '',

    // Contact fields
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_company: '',
  })

  // Fetch contact and partner data
  useEffect(() => {
    const fetchData = async () => {
      if (!lead) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        let newFormData = { ...formData }

        // Fetch Contact
        if (lead.contact_id) {
          try {
            const contactRes = await axiosInstance.get(`/api/contacts/${lead.contact_id}`)
            const contactData = contactRes.data.data

            newFormData = {
              ...newFormData,
              contact_name: contactData.name || '',
              contact_email: contactData.emails?.[0] || '',
              contact_phone: contactData.phone_numbers?.[0] || '',
              contact_company: contactData.company || '',
              // contact_role: contactData.role || '', // usage depends on API
            }
          } catch (err) {
            console.warn('Failed to fetch contact:', err)
          }
        }

        // Fetch Partner
        if (lead.partner_id) {
          try {
            const partnerRes = await axiosInstance.get(`/api/partners/${lead.partner_id}`)
            const partnerData = partnerRes.data.data

            newFormData = {
              ...newFormData,
              partner_name: partnerData.name || '',
              partner_initials: partnerData.initials || '',
              partner_type: partnerData.partner_type?.toUpperCase() || '',
              partner_industry: partnerData.industry || '',
              partner_company_type: partnerData.company_type?.toUpperCase() || '',
              partner_service: partnerData.service || '',
              partner_goods: partnerData.goods || '',
            }
          } catch (err) {
            console.warn('Failed to fetch partner:', err)
          }
        }

        setFormData(newFormData)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [lead])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Contact Validation (only if any contact field is filled)
    const contactFilled = formData.contact_name || formData.contact_email || formData.contact_phone || formData.contact_company
    if (contactFilled) {
      if (!formData.contact_name.trim()) newErrors.contact_name = "Contact name is required"
      if (!formData.contact_email.trim()) newErrors.contact_email = "Email is required"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
        newErrors.contact_email = "Invalid email format"
      }
    }

    // Partner Validation (only if any partner field is filled)
    const partnerFilled = formData.partner_name || formData.partner_initials || formData.partner_industry ||
      formData.partner_company_type || formData.partner_type || formData.partner_service || formData.partner_goods

    if (partnerFilled) {
      if (!formData.partner_name.trim()) newErrors.partner_name = "Partner name is required"
      if (!formData.partner_initials.trim()) newErrors.partner_initials = "Initials are required"
      if (!formData.partner_industry.trim()) newErrors.partner_industry = "Industry is required"
      if (!formData.partner_company_type) newErrors.partner_company_type = "Company type is required"
      if (!formData.partner_type) newErrors.partner_type = "Partner type is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!lead) return
    if (!validateForm()) {
      setNotification({
        isOpen: true,
        title: "Validation Error",
        message: "Please check the highlighted fields.",
        type: "error"
      })
      return
    }

    try {
      setIsSaving(true)

      let contactId = lead.contact_id
      let partnerId = lead.partner_id

      // 1. Update or Create Contact
      if (formData.contact_name) {
        const contactData = {
          name: formData.contact_name,
          emails: formData.contact_email ? [formData.contact_email] : [],
          phone_numbers: formData.contact_phone ? [formData.contact_phone] : [],
          company: formData.contact_company,
        }

        if (contactId) {
          try {
            await axiosInstance.put(`/api/contacts/${contactId}`, contactData)
          } catch (err: any) {
            // If contact not found (404), create new one
            if (err.response?.status === 404) {
              const contactRes = await axiosInstance.post('/api/contacts/create', contactData)
              contactId = contactRes.data.data?.id
            } else {
              throw err
            }
          }
        } else {
          // Create new contact
          const contactRes = await axiosInstance.post('/api/contacts/create', contactData)
          contactId = contactRes.data.data?.id
        }
      }

      // 2. Update or Create Partner
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

        if (partnerId) {
          try {
            await axiosInstance.put(`/api/partners/${partnerId}`, partnerData)
          } catch (err: any) {
            // If partner not found (404), create new one
            if (err.response?.status === 404) {
              const partnerRes = await axiosInstance.post('/api/partners/create', partnerData)
              partnerId = partnerRes.data.data?.id
            } else {
              throw err
            }
          }
        } else {
          // Create new partner
          const partnerRes = await axiosInstance.post('/api/partners/create', partnerData)
          partnerId = partnerRes.data.data?.id
        }
      }

      // 3. Update Lead (Link new IDs if created)
      if (contactId !== lead.contact_id || partnerId !== lead.partner_id) {
        await axiosInstance.put(`/api/leads/${lead.id}`, {
          contact_id: contactId,
          partner_id: partnerId
        })
      }

      setNotification({
        isOpen: true,
        title: "Success",
        message: "General info updated successfully!",
        type: "success"
      })

    } catch (err: any) {
      console.error('Failed to update:', err)
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to update data",
        type: "error"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!lead) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No lead selected</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-black">
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      {/* Partner Info */}
      <div>
        <h3 className="text-sm font-semibold mb-4 text-black">
          🏢 PARTNER INFORMATION
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm block mb-2 text-black">
              Partner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="partner_name"
              value={formData.partner_name}
              onChange={handleChange}
              placeholder="Enter partner name..."
              className={`w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500 ${errors.partner_name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.partner_name && <p className="text-xs text-red-500 mt-1">{errors.partner_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2 text-black">
                Initials <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="partner_initials"
                value={formData.partner_initials}
                onChange={handleChange}
                placeholder="e.g., PTM"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500 ${errors.partner_initials ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.partner_initials && <p className="text-xs text-red-500 mt-1">{errors.partner_initials}</p>}
            </div>

            <div>
              <label className="text-sm block mb-2 text-black">
                Partner Type <span className="text-red-500">*</span>
              </label>
              <select
                name="partner_type"
                value={formData.partner_type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-black focus:outline-none focus:border-sky-500 ${errors.partner_type ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select type...</option>
                <option value="CLIENT">Client</option>
                <option value="VENDOR">Vendor</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="BOTH">Both</option>
              </select>
              {errors.partner_type && <p className="text-xs text-red-500 mt-1">{errors.partner_type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2 text-black">
                Industry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="partner_industry"
                value={formData.partner_industry}
                onChange={handleChange}
                placeholder="e.g., Manufacturing"
                className={`w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500 ${errors.partner_industry ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.partner_industry && <p className="text-xs text-red-500 mt-1">{errors.partner_industry}</p>}
            </div>

            <div>
              <label className="text-sm block mb-2 text-black">
                Company Type <span className="text-red-500">*</span>
              </label>
              <select
                name="partner_company_type"
                value={formData.partner_company_type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm text-black focus:outline-none focus:border-sky-500 ${errors.partner_company_type ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Select type...</option>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
                <option value="GOVERNMENT">Government</option>
                <option value="STATE_OWNED">State Owned</option>
                <option value="NONPROFIT">Nonprofit</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.partner_company_type && <p className="text-xs text-red-500 mt-1">{errors.partner_company_type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2 text-black">
                Service
              </label>
              <input
                type="text"
                name="partner_service"
                value={formData.partner_service}
                onChange={handleChange}
                placeholder="e.g., System Integration"
                className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-sm block mb-2 text-black">
                Goods
              </label>
              <input
                type="text"
                name="partner_goods"
                value={formData.partner_goods}
                onChange={handleChange}
                placeholder="e.g., Networking Device"
                className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="pt-4">
        <h3 className="text-sm font-semibold mb-4 text-black">
          👤 CONTACT DETAILS
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm block mb-2 text-black">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="Full name"
              className={`w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500 ${errors.contact_name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.contact_name && <p className="text-xs text-red-500 mt-1">{errors.contact_name}</p>}
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="email@company.com"
              className={`w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500 ${errors.contact_email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email}</p>}
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Phone Number
            </label>
            <input
              type="text"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="+62..."
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Company
            </label>
            <input
              type="text"
              name="contact_company"
              value={formData.contact_company}
              onChange={handleChange}
              placeholder="Company name"
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-sky-500"
            />
          </div>



          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-black hover:bg-gray-200 transition"
            >
              📎 Attachment
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                '💾 Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}