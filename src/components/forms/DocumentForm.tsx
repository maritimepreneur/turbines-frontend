"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"
import { DOCUMENT_TYPES } from "@/types/document"

interface DocumentFormData {
    name: string
    document_type: string
    url: string
    description: string
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
        name: initialData?.name || "",
        document_type: initialData?.document_type || "",
        url: (initialData as any)?.url || "",
        description: (initialData as any)?.description || ""
    })

    const [errors, setErrors] = useState<Partial<DocumentFormData>>({})
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Sync formData once on mount (parent only renders this component after data is fetched)
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                document_type: initialData.document_type || "",
                url: (initialData as any)?.url || "",
                description: (initialData as any)?.description || ""
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                name: formData.name.trim(),
                document_type: formData.document_type,
                ...(formData.url.trim() ? { url: formData.url.trim() } : {}),
                ...(formData.description.trim() ? { description: formData.description.trim() } : {}),
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
                                        <option key={type.value} value={type.value}>
                                            {type.label}{isEdit && initialData?.document_type === type.value ? ' (Current)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.document_type && <p className="text-xs text-red-500 mt-1">{errors.document_type}</p>}
                                {isEdit && initialData?.document_type && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Current type:{" "}
                                        <span className="font-semibold text-gray-700">
                                            {DOCUMENT_TYPES.find(t => t.value === initialData.document_type)?.label ?? initialData.document_type}
                                        </span>
                                        {" "}
                                        <span className="text-gray-400">({initialData.document_type})</span>
                                    </p>
                                )}
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

                            {/* URL */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-black block mb-1">URL</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    </span>
                                    <input
                                        type="url"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleChange}
                                        placeholder="https://example.com/document"
                                        className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                                    />
                                </div>
                                {formData.url && (
                                    <a href={formData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline mt-1 inline-flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        Open link
                                    </a>
                                )}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-black block mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of this document..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-none"
                                />
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
