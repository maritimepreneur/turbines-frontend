"use client"

import DocumentTable from "@/components/DocumentTable"

export default function BizdevDocumentsPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <p className="text-sm text-slate-400">
                    Bizdev / <span className="text-slate-600">Documents</span>
                </p>
                <h1 className="text-2xl font-semibold mt-1 text-black">Documents</h1>
            </div>
            <DocumentTable moduleId="bizdev" />
        </div>
    )
}
