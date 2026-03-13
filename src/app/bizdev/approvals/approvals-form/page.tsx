"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApproval } from "@/services/approvalService";
import { ApprovalPostRequest, ApprovalType } from "@/types/approval";

// ─── Config ───────────────────────────────────────────────────────────────────

const ENTITY_TYPES: ApprovalType[] = [
    "Quotation",
    "Purchase Order",
    "Invoice",
    "Expense",
];

const ENTITY_FIELD_MAP: Record<ApprovalType, keyof ApprovalPostRequest> = {
    "Quotation": "quotation_id",
    "Purchase Order": "po_id",
    "Invoice": "invoice_id",
    "Expense": "expense_id",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApprovalFormPage() {
    const router = useRouter();

    const [entityType, setEntityType] = useState<ApprovalType>("Quotation");
    const [entityId, setEntityId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const entityField = ENTITY_FIELD_MAP[entityType];

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!entityId || isNaN(Number(entityId)) || Number(entityId) <= 0) {
            setError("Please enter a valid numeric Entity ID.");
            return;
        }

        setLoading(true);
        setError(null);

        // Hanya kirim field yang relevan sesuai entity type
        const payload: ApprovalPostRequest = {
            entity_type: entityType,
            [entityField]: Number(entityId),
        };

        try {
            await createApproval(payload);
            router.push("/bizdev/approvals");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create approval.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <p className="text-sm text-slate-400">
                    Bizdev /{" "}
                    <span
                        className="text-sky-500 cursor-pointer hover:underline"
                        onClick={() => router.push("/bizdev/approvals")}
                    >
                        Approvals
                    </span>{" "}
                    / <span className="text-slate-600">Create</span>
                </p>
                <h1 className="text-2xl font-semibold mt-1 text-black">
                    Create Approval
                </h1>
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg text-black">

                {/* Error Banner */}
                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                        ⚠ {error}
                    </div>
                )}

                {/* Entity Type */}
                <div className="mb-5">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Entity Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <select
                            value={entityType}
                            onChange={(e) => {
                                setEntityType(e.target.value as ApprovalType);
                                setEntityId("");
                                setError(null);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black bg-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer appearance-none"
                        >
                            {ENTITY_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            ▾
                        </span>
                    </div>
                </div>

                {/* Entity ID — conditional field */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {entityField.replace("_id", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())} ID{" "}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        placeholder={`Enter ${entityField}`}
                        value={entityId}
                        onChange={(e) => {
                            setEntityId(e.target.value);
                            setError(null);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder:text-gray-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting…" : "Create Approval"}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}