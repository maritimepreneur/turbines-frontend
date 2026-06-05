"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"
import axiosInstance from "@/lib/axios"

// ─── Constants ───────────────────────────────────────────────────────────────

export const GFORM_TYPES = [
    { value: "Traning Course Registraion", label: "Training Course Registration" },  // typo is intentional, matches backend
    { value: "Training Course Scholarship", label: "Training Course Scholarship" },
    { value: "Others", label: "Others" },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface GFormData {
    name: string
    url: string       // logo link
    batch: string
    date: string
    type: string
    category: string
}

interface GFormProps {
    isEdit?: boolean
    initialData?: GFormData
    gformId?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GForm({ isEdit = false, initialData, gformId }: GFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState<GFormData>({
        name: initialData?.name || "",
        url: initialData?.url || "",
        batch: initialData?.batch || "",
        date: initialData?.date || "",
        type: initialData?.type || "",
        category: initialData?.category || "",
    })

    const [errors, setErrors] = useState<Partial<GFormData>>({})
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Sync once on mount after parent fetches data
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                url: initialData.url || "",
                batch: initialData.batch || "",
                date: initialData.date || "",
                type: initialData.type || "",
                category: initialData.category || "",
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Modals ──────────────────────────────────────────────────────────────
    const [showCancelModal, setShowCancelModal] = useState(false)
    const [notification, setNotification] = useState<{
        isOpen: boolean
        title: string
        message: string
        type: "success" | "error" | "info"
    }>({ isOpen: false, title: "", message: "", type: "success" })

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name as keyof GFormData]) {
            setErrors(prev => ({ ...prev, [name]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Partial<GFormData> = {}
        if (!formData.name.trim()) newErrors.name = "Name is required"
        if (!formData.type) newErrors.type = "Type is required"
        if (!formData.url.trim()) newErrors.url = "URL is required"
        if (!formData.category.trim()) newErrors.category = "Category is required"
        if (!formData.batch.trim()) newErrors.batch = "Batch is required"
        if (!formData.date) newErrors.date = "Date is required"
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
                type: formData.type,
                category: formData.category.trim(),
                batch: Number(formData.batch),
                date: formData.date,
                url: formData.url.trim(),
            }

            if (isEdit) {
                const response = await axiosInstance.put(`/api/gform/${gformId}`, payload)
                if (response.data.code === 200) {
                    setNotification({
                        isOpen: true,
                        title: "Success",
                        message: "GForm updated successfully!",
                        type: "success",
                    })
                    setTimeout(() => router.push("/training-course/gform"), 1500)
                } else {
                    throw new Error(response.data.message || "Failed to update GForm")
                }
            } else {
                const response = await axiosInstance.post("/api/gform/create", payload)
                if (response.data.code === 200 || response.data.code === 201) {
                    setNotification({
                        isOpen: true,
                        title: "Success",
                        message: "GForm created successfully!",
                        type: "success",
                    })
                    setTimeout(() => router.push("/training-course/gform"), 1500)
                } else {
                    throw new Error(response.data.message || "Failed to create GForm")
                }
            }
        } catch (err: any) {
            console.error(`Failed to ${isEdit ? "update" : "create"} GForm:`, err)
            const msg =
                err.response?.data?.message ||
                err.message ||
                `Failed to ${isEdit ? "update" : "create"} GForm`
            setSubmitError(msg)
            setNotification({ isOpen: true, title: "Error", message: msg, type: "error" })
        } finally {
            setIsLoading(false)
        }
    }

    const confirmCancel = () => router.push("/training-course/gform")

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div>
            {/* ── Modals ── */}
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancel}
                title={`Cancel ${isEdit ? "Editing" : "Creation"}`}
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

                            {/* Name — full width */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter GForm name"
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.type ? "border-red-500" : "border-gray-300"}`}
                                >
                                    <option value="">Select Type</option>
                                    {GFORM_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                            {isEdit && initialData?.type === t.value ? " (Current)" : ""}
                                        </option>
                                    ))}
                                </select>
                                {errors.type && (
                                    <p className="text-xs text-red-500 mt-1">{errors.type}</p>
                                )}
                                {isEdit && initialData?.type && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Current type:{" "}
                                        <span className="font-semibold text-gray-700">
                                            {GFORM_TYPES.find(t => t.value === initialData.type)?.label ?? initialData.type}
                                        </span>{" "}
                                        <span className="text-gray-400">({initialData.type})</span>
                                    </p>
                                )}
                            </div>

                            {/* Batch */}
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Batch <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="batch"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    placeholder="e.g. 1"
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.batch ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.batch && (
                                    <p className="text-xs text-red-500 mt-1">{errors.batch}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    placeholder="e.g. scholarship"
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.category ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.category && (
                                    <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                                )}
                            </div>



                            {/* Date */}
                            <div>
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className={`w-full h-10 px-4 border rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${errors.date ? "border-red-500" : "border-gray-300"}`}
                                />
                                {errors.date && (
                                    <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                                )}
                            </div>

                            {/* Logo URL */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-black block mb-1">
                                    Logo Link (URL) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3 items-start">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </span>
                                        <input
                                            type="url"
                                            name="url"
                                            value={formData.url}
                                            onChange={handleChange}
                                            placeholder="https://example.com/logo.png"
                                            className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                                        />
                                    </div>

                                    {/* Live logo preview */}
                                    {formData.url && (
                                        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            <img
                                                src={formData.url}
                                                alt="Logo preview"
                                                className="w-full h-full object-contain"
                                                onError={e => {
                                                    (e.target as HTMLImageElement).style.display = "none"
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {formData.url && (
                                    <a
                                        href={formData.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-sky-600 hover:underline mt-1 inline-flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Open link
                                    </a>
                                )}
                                {errors.url && (
                                    <p className="text-xs text-red-500 mt-1">{errors.url}</p>
                                )}
                            </div>

                        </div>

                        {/* ── Action Buttons ── */}
                        <div className="flex gap-2 pt-4 border-t mt-4">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(true)}
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
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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