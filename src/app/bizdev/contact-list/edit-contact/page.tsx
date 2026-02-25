"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

interface FormData {
    name: string
    emails: string
    phone_numbers: string
    company: string
}

type Contact = {
    id: number
    name: string
    emails?: string[]
    phone_numbers?: string[]
    company?: string
}

interface ContactResponse {
    message: string
    code: number
    data: Contact
}

export default function EditContactPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = parseInt(searchParams.get('id') || '0')

    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    // Fetch contact data
    useEffect(() => {
        if (!id) {
            router.push('/bizdev/contact-list')
            return
        }

        const fetchContactData = async () => {
            try {
                setIsFetching(true)
                setError(null)

                const contactRes = await axiosInstance.get<ContactResponse>(`/api/contacts/${id}`)

                if (contactRes.data.code === 200) {
                    const contact = contactRes.data.data
                    setFormData({
                        name: contact.name || "",
                        emails: contact.emails?.[0] || "",
                        phone_numbers: contact.phone_numbers?.[0] || "",
                        company: contact.company || "",
                    })
                    console.log('✅ Contact data loaded')
                } else {
                    throw new Error(contactRes.data.message || 'Failed to fetch contact')
                }
            } catch (err: any) {
                console.error('❌ Error fetching contact:', err)

                if (err.response?.status === 404) {
                    setError('Contact not found')
                } else if (err.response?.status === 401) {
                    setError('Session expired. Please login again.')
                    router.push('/login')
                } else if (err.response?.data?.message) {
                    setError(err.response.data.message)
                } else {
                    setError('Failed to load contact data')
                }
            } finally {
                setIsFetching(false)
            }
        }

        fetchContactData()
    }, [id, router])

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
            console.log("❌ Form validation failed")
            return
        }

        try {
            setIsLoading(true)
            setSubmitError(null)
            console.log("📤 Updating contact data...", formData)

            const contactData = {
                name: formData.name,
                emails: formData.emails ? [formData.emails] : [],
                phone_numbers: formData.phone_numbers ? [formData.phone_numbers] : [],
                company: formData.company,
            }

            console.log("📤 Updating contact...", contactData)
            const contactRes = await axiosInstance.put(`/api/contacts/${id}`, contactData)

            if (contactRes.data.code === 200 || contactRes.data.code === 201) {
                console.log("✅ Contact updated successfully!")
                setNotification({
                    isOpen: true,
                    title: "Success",
                    message: "Contact updated successfully!",
                    type: "success"
                })
                // Redirect after short delay
                setTimeout(() => {
                    router.push("/bizdev/contact-list")
                }, 1500)
            } else {
                throw new Error(contactRes.data.message || 'Failed to update contact')
            }

        } catch (err: any) {
            console.error("❌ Failed to update contact:", err)
            setSubmitError(err.response?.data?.message || err.message || "Failed to update contact. Please try again.")
            setNotification({
                isOpen: true,
                title: "Error",
                message: err.response?.data?.message || "Failed to update contact",
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

    // Loading state
    if (isFetching) {
        return (
            <div>
                <div className="mb-6">
                    <p className="text-sm text-slate-400">
                        Bizdev / Contact List / <span className="text-slate-600">Edit</span>
                    </p>
                    <h1 className="text-2xl font-semibold mt-1 text-black">Edit Contact</h1>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-600">Loading contact data...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div>
                <div className="mb-6">
                    <p className="text-sm text-slate-400">
                        Bizdev / Contact List / <span className="text-slate-600">Edit</span>
                    </p>
                    <h1 className="text-2xl font-semibold mt-1 text-black">Edit Contact</h1>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Data</h3>
                        <p className="text-slate-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition"
                        >
                            Go Back
                        </button>
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
                <p className="text-sm text-slate-400">
                    Bizdev / Contact List / <span className="text-slate-600">Edit</span>
                </p>
                <h1 className="text-2xl font-semibold mt-1 text-black">Edit Contact</h1>
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
                                    className="px-4 py-2 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
