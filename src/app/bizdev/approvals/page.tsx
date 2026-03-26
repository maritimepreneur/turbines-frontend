'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEye, faFilter, faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import approvalsService, { Approval, ApprovalStatus } from '@/services/approvalService';

const statusStyle: Record<ApprovalStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await approvalsService.getAll({
        page,
        limit,
        ...(filterType && { type: filterType }),
        ...(filterStatus && { status: filterStatus }),
      });
      setApprovals(data.data.list);
      setTotal(data.data.pagination.total_items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [page, filterType, filterStatus]);

  const handleUpdateStatus = async (approval_id: string, status: 'Approved' | 'Rejected') => {
    try {
      await approvalsService.updateStatus(approval_id, { status });
      fetchApprovals();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">Approvals</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Approvals</h1>
        </div>
        <a
          href="/bizdev/approvals/form-approval"
          className="flex items-center gap-2 px-4 py-2 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
          New Approval
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black overflow-hidden">
        <div className="p-4 sm:p-6">

          {/* Filter Bar */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-slate-500 bg-gray-50">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
              Filter
            </div>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="h-8 px-3 text-xs border border-gray-200 rounded-lg text-black bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Type</option>
              <option value="Quotation">Quotation</option>
              <option value="Purchase Order">Purchase Order</option>
              <option value="Invoice">Invoice</option>
              <option value="Expense">Expense</option>
              <option value="Lead">Lead</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="h-8 px-3 text-xs border border-gray-200 rounded-lg text-black bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20 text-slate-400">
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-blue-400" />
              <span className="text-sm">Loading...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center py-20">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-xs font-semibold text-slate-400 pr-6">Approval ID</th>
                      <th className="pb-3 text-xs font-semibold text-slate-400 pr-6">Code</th>
                      <th className="pb-3 text-xs font-semibold text-slate-400 pr-6">Type</th>
                      <th className="pb-3 text-xs font-semibold text-slate-400 pr-6">Date</th>
                      <th className="pb-3 text-xs font-semibold text-slate-400 pr-6">Status</th>
                      <th className="pb-3 text-xs font-semibold text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-sm text-slate-400">
                          No approvals found.
                        </td>
                      </tr>
                    ) : (
                      approvals.map((item) => (
                        <tr
                          key={item.approval_id}
                          className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3.5 pr-6 text-xs font-medium text-blue-600">{item.approval_id}</td>
                          <td className="py-3.5 pr-6 text-xs text-slate-600">{item.code}</td>
                          <td className="py-3.5 pr-6 text-xs text-slate-600">{item.type}</td>
                          <td className="py-3.5 pr-6 text-xs text-slate-500">{item.date}</td>
                          <td className="py-3.5 pr-6">
                            <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${statusStyle[item.status]}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex gap-1.5">
                              <a
                                href={`/bizdev/approvals/${item.approval_id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                              >
                                <FontAwesomeIcon icon={faEye} />
                                Detail
                              </a>
                              {item.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(item.approval_id, 'Approved')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                                  >
                                    <FontAwesomeIcon icon={faCheck} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(item.approval_id, 'Rejected')}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                                  >
                                    <FontAwesomeIcon icon={faTimes} />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-slate-400">
                    Showing{' '}
                    <span className="font-medium text-slate-600">{(page - 1) * limit + 1}</span>
                    {' '}–{' '}
                    <span className="font-medium text-slate-600">{Math.min(page * limit, total)}</span>
                    {' '}of{' '}
                    <span className="font-medium text-slate-600">{total}</span> results
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md">
                      {page}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}