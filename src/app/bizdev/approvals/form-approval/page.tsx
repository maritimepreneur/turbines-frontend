'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons';
import approvalsService from '@/services/approvalService';

type FormData = {
    entity_type: string;
    quotation_id: string;
    po_id: string;
    invoice_id: string;
    expense_id: string;
    lead_id: string;
};

const inputClass =
    'w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

export default function FormApprovalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>({
        entity_type: '',
        quotation_id: '',
        po_id: '',
        invoice_id: '',
        expense_id: '',
        lead_id: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({
            entity_type: e.target.value,
            quotation_id: '',
            po_id: '',
            invoice_id: '',
            expense_id: '',
            lead_id: '',
        });
    };

    const handleSubmit = async () => {
        if (!form.entity_type) {
            setError('Type is required.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await approvalsService.create({
                entity_type: form.entity_type,
                quotation_id: form.quotation_id ? Number(form.quotation_id) : null,
                po_id: form.po_id ? Number(form.po_id) : null,
                invoice_id: form.invoice_id ? Number(form.invoice_id) : null,
                expense_id: form.expense_id ? Number(form.expense_id) : null,
                lead_id: form.lead_id ? Number(form.lead_id) : null,
            });
            router.push('/bizdev/approvals');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const renderReferenceField = () => {
        const fields: Record<string, { label: string; name: keyof FormData; placeholder: string }> = {
            Quotation: { label: 'Quotation ID', name: 'quotation_id', placeholder: 'Enter Quotation ID' },
            'Purchase Order': { label: 'Purchase Order ID', name: 'po_id', placeholder: 'Enter PO ID' },
            Invoice: { label: 'Invoice ID', name: 'invoice_id', placeholder: 'Enter Invoice ID' },
            Expense: { label: 'Expense ID', name: 'expense_id', placeholder: 'Enter Expense ID' },
            Lead: { label: 'Lead ID', name: 'lead_id', placeholder: 'Enter Lead ID' },
        };
        const field = fields[form.entity_type];
        if (!field) return null;
        return (
            <>
                <label className="text-xs font-semibold text-black block mb-1">{field.label}</label>
                <input
                    type="number"
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={inputClass}
                />
            </>
        );
    };

    return (
        <div>
            <div className="mb-6">
                <p className="text-sm text-slate-400">
                    Bizdev /{' '}
                    <a href="/bizdev/approvals" className="text-slate-400 hover:text-slate-600">
                        Approvals
                    </a>{' '}
                    / <span className="text-slate-600">Form</span>
                </p>
                <h1 className="text-2xl font-semibold mt-1 text-black">New Approval</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm text-black overflow-hidden">
                <div className="p-4 sm:p-6">

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 mb-6"
                    >
                        <FontAwesomeIcon icon={faArrowLeftLong} />
                        Back to Approvals
                    </button>

                    {error && (
                        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-semibold text-black block mb-1">Type <span className="text-red-500">*</span></label>
                            <select
                                name="entity_type"
                                value={form.entity_type}
                                onChange={handleTypeChange}
                                className={inputClass}
                            >
                                <option value="">Select Type</option>
                                <option value="Quotation">Quotation</option>
                                <option value="Purchase Order">Purchase Order</option>
                                <option value="Invoice">Invoice</option>
                                <option value="Expense">Expense</option>
                                <option value="Lead">Lead</option>
                            </select>
                        </div>

                        <div>{renderReferenceField()}</div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => router.back()}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}