"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

interface FormData {
  // Lead info
  name: string
  period: string
  description: string

  // Contact info
  contact_id: number | null
  contact_name: string
  contact_email: string
  contact_phone: string
  contact_company: string

  // Partner info
  partner_id: number | null
  partner_name: string
  partner_initials: string
  partner_industry: string
  partner_company_type: string
  partner_type: string
  partner_service: string
  partner_goods: string
}

export default function EditLeadsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('id')

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    period: "",
    description: "",
    contact_id: null,
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_company: "",
    partner_id: null,
    partner_name: "",
    partner_initials: "",
    partner_industry: "",
    partner_company_type: "",
    partner_type: "",
    partner_service: "",
    partner_goods: "",
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

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Partner dropdown states
  const [partnerSearch, setPartnerSearch] = useState("")
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null)
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false)
  const [partnersData, setPartnersData] = useState<any[]>([])
  const [isLoadingPartners, setIsLoadingPartners] = useState(false)

  // Fetch partners from database using axios (Load All & Filter Client-side)
  useEffect(() => {
    // Only fetch when dropdown is shown and data is empty
    if (!showPartnerDropdown || partnersData.length > 0) return

    const fetchPartners = async () => {
      setIsLoadingPartners(true)
      try {
        console.log('📡 Fetching all partners list...')
        const response = await axiosInstance.get('/api/leads/partner-list') // Fetch all

        // Extract data array from response
        const partnersArray = response.data.data || response.data || []
        console.log('📡 Partners Loaded:', partnersArray.length)

        setPartnersData(partnersArray)
      } catch (error) {
        console.error('❌ Error fetching partners:', error)
      } finally {
        setIsLoadingPartners(false)
      }
    }

    fetchPartners()
  }, [showPartnerDropdown]) // Remove partnerSearch dependency

  // Contact dropdown states
  const [contactSearch, setContactSearch] = useState("")
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [showContactDropdown, setShowContactDropdown] = useState(false)
  const [contactsData, setContactsData] = useState<any[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)

  // Fetch contacts from database
  useEffect(() => {
    if (!showContactDropdown || contactsData.length > 0) return

    const fetchContacts = async () => {
      setIsLoadingContacts(true)
      try {
        const response = await axiosInstance.get('/api/contacts/')
        const contactsArray = response.data.data || response.data || []
        setContactsData(contactsArray)
      } catch (error) {
        console.error('❌ Error fetching contacts:', error)
      } finally {
        setIsLoadingContacts(false)
      }
    }

    fetchContacts()
  }, [showContactDropdown])

  // ... (some code)

  // Filter partners client-side
  const filteredPartners = partnersData.filter((partner: any) =>
    partner.name.toLowerCase().includes(partnerSearch.toLowerCase())
  )

  const filteredContacts = contactsData.filter((contact: any) =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.partner-dropdown-container')) {
        setShowPartnerDropdown(false)
      }
      if (!target.closest('.contact-dropdown-container')) {
        setShowContactDropdown(false)
      }
    }

    if (showPartnerDropdown || showContactDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPartnerDropdown, showContactDropdown])

  // Fetch lead data
  useEffect(() => {
    if (!leadId) {
      router.push('/bizdev/new-leads')
      return
    }

    const fetchLeadData = async () => {
      try {
        setIsFetching(true)
        console.log('📥 Fetching lead data...', leadId)

        // Fetch lead
        const leadRes = await axiosInstance.get(`/api/leads/${leadId}`)
        const lead = leadRes.data.data

        console.log('✅ Lead data:', lead)

        // Set lead data
        const newFormData: any = {
          name: lead.name || "",
          period: lead.period || "",
          description: lead.description || "",
          contact_id: lead.contact_id || null,
          partner_id: lead.partner_id || null,
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
        }

        // Fetch contact if exists
        if (lead.contact_id) {
          try {
            const contactRes = await axiosInstance.get(`/api/contacts/${lead.contact_id}`)
            const contact = contactRes.data.data
            console.log('✅ Contact data:', contact)

            newFormData.contact_name = contact.name || ""
            newFormData.contact_email = contact.emails?.[0] || ""
            newFormData.contact_phone = contact.phone_numbers?.[0] || ""
            newFormData.contact_company = contact.company || ""

            setContactSearch(contact.name || "")
            setSelectedContactId(lead.contact_id)
          } catch (err) {
            console.warn('⚠️ Failed to fetch contact')
            newFormData.contact_id = null // Reset ID if fetch fails to avoid updating non-existent record
          }
        }

        // Fetch partner if exists
        if (lead.partner_id) {
          try {
            const partnerRes = await axiosInstance.get(`/api/partners/${lead.partner_id}`)
            const partner = partnerRes.data.data
            console.log('✅ Partner data:', partner)

            newFormData.partner_name = partner.name || ""
            newFormData.partner_initials = partner.initials || ""
            newFormData.partner_industry = partner.industry || ""
            newFormData.partner_company_type = partner.company_type?.toUpperCase() || ""
            newFormData.partner_type = partner.partner_type?.toUpperCase() || ""
            newFormData.partner_service = partner.service || ""
            newFormData.partner_goods = partner.goods || ""
          } catch (err) {
            console.warn('⚠️ Failed to fetch partner')
            newFormData.partner_id = null // Reset ID if fetch fails
          }
        }

        setFormData(newFormData)
      } catch (err: any) {
        console.error('❌ Failed to fetch lead:', err)
        setNotification({
          isOpen: true,
          title: "Error",
          message: "Failed to load lead data",
          type: "error"
        })
        setTimeout(() => router.push('/bizdev/new-leads'), 2000)
      } finally {
        setIsFetching(false)
      }
    }

    fetchLeadData()
  }, [leadId, router])

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

  // Handle partner selection from dropdown
  const handlePartnerSelect = (partnerId: number) => {
    const selectedPartner = partnersData?.find((p: any) => p.id === partnerId)
    if (selectedPartner) {
      setSelectedPartnerId(partnerId)
      setPartnerSearch(selectedPartner.name)
      setShowPartnerDropdown(false)

      // Set partner name
      setFormData(prev => ({
        ...prev,
        partner_name: selectedPartner.name || "",
      }))
    }
  }

  // Handle partner search input
  const handlePartnerSearchChange = (value: string) => {
    setPartnerSearch(value)
    setShowPartnerDropdown(true)
    setFormData(prev => ({ ...prev, partner_name: value, partner_id: null }))

    // Clear selected ID if manually typing
    if (selectedPartnerId) {
      setSelectedPartnerId(null)
    }
  }

  // Handle contact selection from dropdown
  const handleContactSelect = (contactId: number) => {
    const selectedContact = contactsData?.find((c: any) => c.id === contactId)
    if (selectedContact) {
      setSelectedContactId(contactId)
      setContactSearch(selectedContact.name)
      setShowContactDropdown(false)

      setFormData(prev => ({
        ...prev,
        contact_id: contactId,
        contact_name: selectedContact.name || "",
        contact_email: selectedContact.emails?.[0] || "",
        contact_phone: selectedContact.phone_numbers?.[0] || "",
        contact_company: selectedContact.company || "",
      }))
    }
  }

  // Handle contact search input
  const handleContactSearchChange = (value: string) => {
    setContactSearch(value)
    setShowContactDropdown(true)
    setFormData(prev => ({ ...prev, contact_name: value, contact_id: null }))

    // Clear selected ID if manually typing
    if (selectedContactId) {
      setSelectedContactId(null)
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.period) {
      newErrors.period = "Period is required"
    }

    // Contact Validation
    const contactFilled = formData.contact_name || formData.contact_email || formData.contact_phone || formData.contact_company
    if (contactFilled) {
      if (!formData.contact_name.trim()) {
        newErrors.contact_name = "Contact name is required"
      }
      if (!formData.contact_email.trim()) {
        newErrors.contact_email = "Email is required"
      } else if (!formData.contact_email.includes('@') || !formData.contact_email.includes('.')) {
        newErrors.contact_email = "Invalid email format"
      }
    }

    // Partner Validation
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
      console.log("📤 Updating lead data...", formData)

      let contactId = formData.contact_id
      let partnerId = formData.partner_id

      // 1. Update or Create Contact
      if (formData.contact_name) {
        const contactData = {
          name: formData.contact_name,
          emails: formData.contact_email ? [formData.contact_email] : [],
          phone_numbers: formData.contact_phone ? [formData.contact_phone.replace(/[^\d+]/g, '')] : [],
          company: formData.contact_company,
        }

        if (contactId) {
          // Update existing contact
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
      } else {
        // If contact name is empty, clear the relation
        contactId = null
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
          // Update existing partner
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
      } else {
        // If partner name is empty, clear the relation
        partnerId = null
      }

      // 3. Update Lead
      const leadData: any = {
        name: formData.name,
        period: formData.period,
        description: formData.description,
        contact_id: contactId,
        partner_id: partnerId,
      }

      console.log("📤 Updating lead...", leadData)
      const leadRes = await axiosInstance.put(`/api/leads/${leadId}`, leadData)

      if (leadRes.data.code === 200 || leadRes.data.code === 201) {
        setNotification({
          isOpen: true,
          title: "Success",
          message: "Lead updated successfully!",
          type: "success"
        })
        setTimeout(() => {
          router.push("/bizdev/new-leads")
        }, 1500)
      } else {
        throw new Error(leadRes.data.message || 'Failed to update lead')
      }

    } catch (err: any) {
      console.error("❌ Failed to update lead:", err)
      setSubmitError(err.response?.data?.message || err.message || "Failed to update lead. Please try again.")
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to update lead",
        type: "error"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setShowCancelModal(true)
  }

  const confirmCancel = () => {
    router.push("/bizdev/new-leads")
  }

  // Loading state
  if (isFetching) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">Bizdev</p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Edit Lead</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading lead data...</p>
            </div>
          </div>
        </div>
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
        <p className="text-sm text-slate-400">Bizdev</p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Edit Lead</h1>
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
          <div className="max-h-none sm:max-h-[calc(100vh-240px)] overflow-y-auto">
            <div className="p-4 sm:p-6">
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
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.name ? "border-red-500" : "border-gray-300"
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
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.period ? "border-red-500" : "border-gray-300"
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
                  <div className="relative contact-dropdown-container">
                    <input
                      type="text"
                      name="contact_name"
                      value={contactSearch || formData.contact_name}
                      onChange={(e) => handleContactSearchChange(e.target.value)}
                      onFocus={() => setShowContactDropdown(true)}
                      placeholder="Person in charge"
                      className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.contact_name ? "border-red-500" : "border-gray-300"
                        }`}
                      autoComplete="off"
                    />

                    {showContactDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingContacts ? (
                          <div className="px-4 py-3 text-center text-gray-500">
                            <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading contacts...
                          </div>
                        ) : filteredContacts.length > 0 ? (
                          filteredContacts.map((contact: any) => (
                            <div
                              key={contact.id}
                              onClick={() => handleContactSelect(contact.id)}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-semibold text-sm text-black">{contact.name}</div>
                              {contact.company && <div className="text-xs text-gray-500">{contact.company}</div>}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            {contactSearch ? 'Contact tidak ditemukan' : 'Tidak ada data contact'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.contact_email ? "border-red-500" : "border-gray-300"
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
                  <div className="relative partner-dropdown-container">
                    <input
                      type="text"
                      name="partner_name"
                      value={partnerSearch || formData.partner_name}
                      onChange={(e) => handlePartnerSearchChange(e.target.value)}
                      onFocus={() => setShowPartnerDropdown(true)}
                      placeholder="Pilih atau ketik nama partner"
                      className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.partner_name ? "border-red-500" : "border-gray-300"}`}
                      autoComplete="off"
                    />

                    {/* Dropdown untuk menampilkan partner dari database */}
                    {showPartnerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingPartners ? (
                          <div className="px-4 py-3 text-center text-gray-500">
                            <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading partners...
                          </div>
                        ) : filteredPartners.length > 0 ? (
                          filteredPartners.map((partner: any) => (
                            <div
                              key={partner.id}
                              onClick={() => handlePartnerSelect(partner.id)}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-semibold text-sm text-black">{partner.name}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            {partnerSearch ? 'Partner tidak ditemukan' : 'Tidak ada data partner'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.partner_name && (
                    <p className="text-xs text-red-500 mb-3">{errors.partner_name}</p>
                  )}
                  {!errors.partner_name && <div className="mb-3"></div>}

                  <label className="text-xs font-semibold text-black block mb-1">
                    Initials
                  </label>
                  <input
                    type="text"
                    name="partner_initials"
                    value={formData.partner_initials}
                    onChange={handleChange}
                    placeholder="e.g., PTM"
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.partner_initials ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.partner_initials && (
                    <p className="text-xs text-red-500 mb-3">{errors.partner_initials}</p>
                  )}
                  {!errors.partner_initials && <div className="mb-3"></div>}

                  <label className="text-xs font-semibold text-black block mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="partner_industry"
                    value={formData.partner_industry}
                    onChange={handleChange}
                    placeholder="e.g., Manufacturing, Technology"
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.partner_industry ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.partner_industry && (
                    <p className="text-xs text-red-500 mb-3">{errors.partner_industry}</p>
                  )}
                  {!errors.partner_industry && <div className="mb-3"></div>}

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
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.partner_company_type ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select Company Type</option>
                    <option value="PRIVATE">Private</option>
                    <option value="PUBLIC">Public</option>
                    <option value="GOVERNMENT">Government</option>
                    <option value="STATE_OWNED">State Owned</option>
                    <option value="NONPROFIT">Nonprofit</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.partner_company_type && (
                    <p className="text-xs text-red-500 mb-3">{errors.partner_company_type}</p>
                  )}
                  {!errors.partner_company_type && <div className="mb-3"></div>}


                  <label className="text-xs font-semibold text-black block mb-1">
                    Partner Type
                  </label>
                  <select
                    name="partner_type"
                    value={formData.partner_type}
                    onChange={handleChange}
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.partner_type ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Select Partner Type</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="CLIENT">Client</option>
                    <option value="BOTH">Both</option>
                  </select>
                  {errors.partner_type && (
                    <p className="text-xs text-red-500 mb-3">{errors.partner_type}</p>
                  )}
                  {!errors.partner_type && <div className="mb-3"></div>}

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
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Update</span>
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