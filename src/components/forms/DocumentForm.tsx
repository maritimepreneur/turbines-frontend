"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"
import { DOCUMENT_TYPES } from "@/types/document"

interface DocumentFormData {
    number: string
    name: string
    document_type: string
}

interface DocumentFormProps {
    moduleId: 'bizdev' | 'finance' | 'operation';
    isEdit?: boolean;
    initialData?: DocumentFormData;
    documentId?: number;
}

export default function DocumentForm({ moduleId, isEdit = false, initialData, documentId }: DocumentFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<DocumentFormData>({
        number: initialData?.number || "",
        name: initialData?.name || "",
        document_type: initialData?.document_type || ""
    })

    const [errors, setErrors] = useState<Partial<DocumentFormData>>({})
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Modals
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (errors[name as keyof DocumentFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<DocumentFormData> = {}

        if (!formData.number.trim()) newErrors.number = "Document Number is required"
        if (!formData.name.trim()) newErrors.name = "Document Name is required"
        if (!formData.document_type) newErrors.document_type = "Document Type is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            setIsLoading(true)
            setSubmitError(null)

            const payload = {
                number: formData.number,
                name: formData.name.trim(),
                document_type: formData.document_type
            }

            if (isEdit) {
                const response = await axiosInstance.put(`/api/documents/${documentId}`, payload)
                if (response.data.code === 200) {
                    setNotification({
                        isOpen: true,
                        title: "Success",
                        message: "Document updated successfully!",
                        type: "success"
                    })
                    setTimeout(() => {
                        router.push(`/${moduleId}/documents`)
                    }, 1500)
                } else {
                    throw new Error(response.data.message || 'Failed to update document')
                }
            } else {
                const response = await axiosInstance.post('/api/documents/create', payload)

                if (response.data.code === 200 || response.data.code === 201) {
                    setNotification({
                        isOpen: true,
                        title: "Success",
                        message: "Document created successfully!",
                        type: "success"
                    })
                    setTimeout(() => {
                        router.push(`/${moduleId}/documents`)
                    }, 1500)
                } else {
                    throw new Error(response.data.message || 'Failed to create document')
                }
            }

        } catch (err: any) {
            console.error(`Failed to ${isEdit ? 'update' : 'create'} document:`, err)
            setSubmitError(err.response?.data?.message || err.message || `Failed to ${isEdit ? 'update' : 'create'} document`)
            setNotification({
                isOpen: true,
                title: "Error",
                message: err.message || `Failed to ${isEdit ? 'update' : 'create'} document`,
                type: "error"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setShowCancelModal(true)
    }

    const confirmCancel = () => {
        router.push(`/${moduleId}/documents`)
    }

    return (
        <div>
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancel}
                title={`Cancel ${isEdit ? 'Editing' : 'Creation'}`}
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

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Document Number */}
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Document Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleChange}
                                    placeholder="Enter document number"
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.number ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
                            </div>

                            {/* Document Type */}
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Document Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="document_type"
                                    value={formData.document_type}
                                    onChange={handleChange}
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.document_type ? "border-red-500" : "border-gray-300"}`}
                                >
                                    <option value="">Select Document Type</option>
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                                {errors.document_type && <p className="text-xs text-red-500 mt-1">{errors.document_type}</p>}
                            </div>

                            {/* Document Name */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Document Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter document name"
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t mt-4">
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
                </form>
            </div>
        </div>
    )
}
