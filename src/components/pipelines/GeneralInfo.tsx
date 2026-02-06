'use client'

import { useState, useEffect } from 'react'
import axiosInstance from '@/lib/axios'

interface Lead {
  id: number
  name: string
  period: string
  description: string
  contact_id: number | null
  partner_id: number
  current_stages: string
  contact_name: string | null
  company: string | null
  partner_name: string
}

interface Contact {
  id: number
  name: string
  emails: string[]
  phone_numbers: string[]
  company: string
}

interface Partner {
  id: number
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string
  service: string
  goods: string
}

interface GeneralInfoProps {
  lead?: Lead
}

export default function GeneralInfo({ lead }: GeneralInfoProps) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    contact_role: '',
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

        // Fetch Contact
        if (lead.contact_id) {
          try {
            const contactRes = await axiosInstance.get(`/api/contacts/${lead.contact_id}`)
            const contactData = contactRes.data.data
            setContact(contactData)
            
            setFormData(prev => ({
              ...prev,
              contact_name: contactData.name || '',
              contact_email: contactData.emails?.[0] || '',
              contact_phone: contactData.phone_numbers?.[0] || '',
              contact_company: contactData.company || '',
            }))
          } catch (err) {
            console.error('Failed to fetch contact:', err)
          }
        }

        // Fetch Partner
        if (lead.partner_id) {
          try {
            const partnerRes = await axiosInstance.get(`/api/partners/${lead.partner_id}`)
            const partnerData = partnerRes.data.data
            setPartner(partnerData)
            
            setFormData(prev => ({
              ...prev,
              partner_name: partnerData.name || '',
              partner_initials: partnerData.initials || '',
              partner_type: partnerData.partner_type || '',
              partner_industry: partnerData.industry || '',
              partner_company_type: partnerData.company_type || '',
              partner_service: partnerData.service || '',
              partner_goods: partnerData.goods || '',
            }))
          } catch (err) {
            console.error('Failed to fetch partner:', err)
          }
        }
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
  }

  const handleSave = async () => {
    if (!lead) return

    try {
      // Update Contact
      if (lead.contact_id && formData.contact_name) {
        await axiosInstance.put(`/api/contacts/${lead.contact_id}`, {
          name: formData.contact_name,
          emails: formData.contact_email ? [formData.contact_email] : [],
          phone_numbers: formData.contact_phone ? [formData.contact_phone] : [],
          company: formData.contact_company,
        })
      }

      // Update Partner
      if (lead.partner_id && formData.partner_name) {
        await axiosInstance.put(`/api/partners/${lead.partner_id}`, {
          name: formData.partner_name,
          initials: formData.partner_initials,
          industry: formData.partner_industry,
          company_type: formData.partner_company_type,
          partner_type: formData.partner_type,
          service: formData.partner_service,
          goods: formData.partner_goods,
        })
      }

      alert('Data updated successfully!')
    } catch (err) {
      console.error('Failed to update:', err)
      alert('Failed to update data')
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
      {/* Partner Info */}
      <div>
        <h3 className="text-sm font-semibold mb-4 text-black">
          🏢 PARTNER INFORMATION
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm block mb-2 text-black">
              Partner Name
            </label>
            <input
              type="text"
              name="partner_name"
              value={formData.partner_name}
              onChange={handleChange}
              placeholder="Enter partner name..."
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2 text-black">
                Initials
              </label>
              <input
                type="text"
                name="partner_initials"
                value={formData.partner_initials}
                onChange={handleChange}
                placeholder="e.g., PTM"
                className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="text-sm block mb-2 text-black">
                Partner Type
              </label>
              <select 
                name="partner_type"
                value={formData.partner_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm text-black"
              >
                <option value="">Select type...</option>
                <option value="CLIENT">Client</option>
                <option value="VENDOR">Vendor</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2 text-black">
                Industry
              </label>
              <input
                type="text"
                name="partner_industry"
                value={formData.partner_industry}
                onChange={handleChange}
                placeholder="e.g., Manufacturing"
                className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="text-sm block mb-2 text-black">
                Company Type
              </label>
              <select
                name="partner_company_type"
                value={formData.partner_company_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm text-black"
              >
                <option value="">Select type...</option>
                <option value="PRIVATE">Private</option>
                <option value="PUBLIC">Public</option>
                <option value="GOVERNMENT">Government</option>
                <option value="STATE_OWNED">State Owned</option>
              </select>
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
                className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
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
                className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
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
              Name
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="email@company.com"
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
            />
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
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
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
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Role
            </label>
            <input
              type="text"
              name="contact_role"
              value={formData.contact_role}
              onChange={handleChange}
              placeholder="e.g., Director, Manager"
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
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
              className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition"
            >
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}