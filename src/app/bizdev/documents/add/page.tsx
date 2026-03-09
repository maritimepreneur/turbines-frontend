"use client"

import DocumentForm from "@/components/forms/DocumentForm"

export default function BizdevAddDocumentPage() {
    return (
        <div>
            <div className="mb-6">
                <p className="text-sm text-slate-400">
                    Bizdev / Documents / <span className="text-slate-600">Add</span>
                </p>
                <h1 className="text-2xl font-semibold mt-1 text-black">Add Document</h1>
            </div>
            <DocumentForm moduleId="bizdev" />
        </div>
    )
}
