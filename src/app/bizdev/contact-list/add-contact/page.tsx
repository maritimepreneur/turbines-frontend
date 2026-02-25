"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

interface FormData {
  name: string
  emails: string
  phone_numbers: string
  company: string
}

export default function AddContactPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    emails: "",
    phone_numbers: "",
    company: "",
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
      newErrors.name = "Contact name is required"
    }

    if (!formData.emails.trim()) {
      newErrors.emails = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emails)) {
      newErrors.emails = "Invalid email format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)
      setSubmitError(null)

      const contactData = {
        name: formData.name,
        emails: formData.emails ? [formData.emails] : [],
        phone_numbers: formData.phone_numbers ? [formData.phone_numbers] : [],
        company: formData.company,
      }

      const contactRes = await axiosInstance.post('/api/contacts/create', contactData)

      if (contactRes.data.code === 200 || contactRes.data.code === 201) {
        setNotification({
          isOpen: true,
          title: "Success",
          message: "Contact created successfully!",
          type: "success"
        })
        // Redirect after short delay
        setTimeout(() => {
          router.push("/bizdev/contact-list")
        }, 1500)
      } else {
        throw new Error(contactRes.data.message || 'Failed to create contact')
      }

    } catch (err: any) {
      console.error("❌ Failed to create contact:", err)
      setSubmitError(err.response?.data?.message || err.message || "Failed to create contact. Please try again.")
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || "Failed to create contact",
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
    router.push("/bizdev/contact-list")
  }

  return (
    <div>
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
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
          Bizdev / Contact List / <span className="text-slate-600">Add</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Add Contact</h1>
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
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Person in charge"
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mb-3">{errors.name}</p>
                  )}
                  {!errors.name && <div className="mb-3"></div>}

                  <label className="text-xs font-semibold text-black block mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="emails"
                    value={formData.emails}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className={`w-full h-10 mb-1 px-4 border rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${errors.emails ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                  {errors.emails && (
                    <p className="text-xs text-red-500 mb-3">{errors.emails}</p>
                  )}
                  {!errors.emails && <div className="mb-3"></div>}
                </div>

                {/* Right Column */}
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_numbers"
                    value={formData.phone_numbers}
                    onChange={handleChange}
                    placeholder="+62 xxx xxxx xxxx"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
