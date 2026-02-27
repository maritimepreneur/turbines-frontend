"use client"

import { useEffect, useState } from "react"
import DocumentForm from "@/components/forms/DocumentForm"
import axiosInstance from "@/lib/axios"
import { useParams, useRouter } from "next/navigation"

export default function BizdevEditDocumentPage() {
    const params = useParams()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [initialData, setInitialData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const id = params.id as string

    useEffect(() => {
        const fetchDocument = async () => {
            if (!id) return

            try {
                setIsLoading(true)
                const response = await axiosInstance.get(`/api/documents/${id}`)

                if (response.data.code === 200) {
                    const doc = response.data.data
                    // Transform API data to form data
                    setInitialData({
                        number: String(doc.number), // Convert to string for form
                        name: doc.name,
                        document_type: doc.document_type
                    })
                } else {
                    throw new Error(response.data.message || 'Failed to fetch document')
                }
            } catch (err: any) {
                console.error("Failed to fetch document:", err)
                setError(err.message || "Failed to load document")
            } finally {
                setIsLoading(false)
            }
        }

        fetchDocument()
    }, [id])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <p className="font-semibold">Error loading document</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-3 text-sm font-medium underline hover:text-red-900"
                    >
                        Go back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <p className="text-sm text-slate-400 mb-2">
                    <span onClick={() => router.push('/bizdev/documents')} className="cursor-pointer hover:text-slate-600">Documents</span> / <span className="text-slate-600">Edit</span>
                </p>
                <h1 className="text-2xl font-bold text-slate-900">Edit Document</h1>
            </div>

            {initialData && (
                <DocumentForm
                    moduleId="bizdev"
                    isEdit={true}
                    initialData={initialData}
                    documentId={Number(id)}
                />
            )}
        </div>
    )
}
