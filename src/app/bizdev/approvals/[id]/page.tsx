'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeftLong, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import approvalsService, { Approval, ApprovalStatus } from '@/services/approvalService';

const statusStyle: Record<ApprovalStatus, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <>
        <label className="text-xs font-semibold text-black block mb-1">{label}</label>
        <div className="w-full h-10 mb-4 px-4 flex items-center border border-gray-200 rounded-lg bg-gray-50 text-xs text-slate-600">
            {value}
        </div>
    </>
);

export default function ApprovalDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [detail, setDetail] = useState<Approval | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await approvalsService.getById(id as string);
            setDetail(data.data);  // ← tambah .data
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const handleUpdateStatus = async (status: 'Approved' | 'Rejected') => {
        if (!detail) return;
        setActionLoading(true);
        try {
            await approvalsService.updateStatus(detail.approval_id, { status });
            await fetchDetail();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!detail) return;
        const confirmed = window.confirm('Are you sure you want to delete this approval?');
        if (!confirmed) return;
        try {
            await approvalsService.delete(detail.approval_id);
            router.push('/bizdev/approvals');
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : 'Failed to delete');
        }
    };

    return (
        <div>
            <div className="mb-6">
                <p className="text-sm text-slate-400">
                    Bizdev /{' '}
                    <a href="/bizdev/approvals" className="text-slate-400 hover:text-slate-600">
                        Approvals
                    </a>{' '}
                    / <span className="text-slate-600">{id}</span>
                </p>
                <h1 className="text-2xl font-semibold mt-1 text-black">Approval Detail</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm text-black max-h-none sm:max-h-[calc(100vh-160px)] overflow-y-auto">
                <div className="p-4 sm:p-6">

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 mb-6"
                    >
                        <FontAwesomeIcon icon={faArrowLeftLong} />
                        Back to Approvals
                    </button>

                    {loading && (
                        <div className="flex justify-center items-center py-16 text-slate-400">
                            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                            <span className="text-sm">Loading...</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-16 text-sm text-red-500">{error}</div>
                    )}

                    {!loading && !error && detail && (
                        <>
                            <div className="flex items-center gap-3 mb-6">
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusStyle[detail.status]}`}>
                                    {detail.status}
                                </span>
                                <span className="text-xs text-slate-400">{detail.code}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <Field label="Approval ID" value={detail.approval_id} />
                                    <Field label="Code" value={detail.code} />
                                    <Field label="Type" value={detail.type} />
                                    <Field label="Date" value={detail.date} />
                                </div>
                                <div>
                                    {detail.quotation_id && <Field label="Quotation ID" value={detail.quotation_id} />}
                                    {detail.po_id && <Field label="Purchase Order ID" value={detail.po_id} />}
                                    {detail.invoice_id && <Field label="Invoice ID" value={detail.invoice_id} />}
                                    {detail.expense_id && <Field label="Expense ID" value={detail.expense_id} />}
                                    {detail.lead_id && <Field label="Lead ID" value={detail.lead_id} />}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => router.back()}
                                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                {detail.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus('Approved')}
                                            disabled={actionLoading}
                                            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                            {actionLoading ? 'Processing...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus('Rejected')}
                                            disabled={actionLoading}
                                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                            {actionLoading ? 'Processing...' : 'Reject'}
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 ml-auto"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}