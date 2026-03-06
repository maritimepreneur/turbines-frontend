"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { NotificationModal } from "@/components/modals/NotificationModal";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { Pagination } from "@/components/table/Pagination";
import { useTableFilters } from "@/hooks/useTableFilters";
import {
  Approval,
  ApprovalType,
  ApprovalStatus,
  ApprovalPostRequest,
  ApprovalUpdateRequest,
} from "@/types/approval";
import {
  getApprovals,
  createApproval,
  updateApprovalStatus,
  deleteApproval,
} from "@/services/approvalService";

// ─── Mapping entity type → field ID yang relevan ──────────────────────────────

const entityFieldMap: Record<ApprovalType, { label: string; key: keyof ApprovalPostRequest }> = {
  Quotation: { label: "Quotation ID", key: "quotation_id" },
  "Purchase Order": { label: "PO ID", key: "po_id" },
  Invoice: { label: "Invoice ID", key: "invoice_id" },
  Expense: { label: "Expense ID", key: "expense_id" },
};

// ─── Form Modal (Add / Edit) ──────────────────────────────────────────────────

interface ApprovalFormModalProps {
  isOpen: boolean;
  mode: "add" | "edit";
  initial?: Approval;
  onClose: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
}

function ApprovalFormModal({
  isOpen,
  mode,
  initial,
  onClose,
  onSaved,
  onError,
}: ApprovalFormModalProps) {
  const [entityType, setEntityType] = useState<ApprovalType>(initial?.type ?? "Quotation");
  const [entityId, setEntityId] = useState("");
  const [status, setStatus] = useState<ApprovalStatus>(initial?.status ?? "New Request");
  const [loading, setLoading] = useState(false);

  // Ambil nilai ID awal saat edit
  const getInitialId = (type: ApprovalType, data?: Approval) => {
    if (!data) return "";
    const map: Record<ApprovalType, number | null> = {
      Quotation: data.quotation_id,
      "Purchase Order": data.po_id,
      Invoice: data.invoice_id,
      Expense: data.expense_id,
    };
    return map[type]?.toString() ?? "";
  };

  useEffect(() => {
    if (isOpen) {
      const type = initial?.type ?? "Quotation";
      setEntityType(type);
      setEntityId(getInitialId(type, initial));
      setStatus(initial?.status ?? "New Request");
    }
  }, [isOpen, initial]);

  // Reset ID saat entity type berubah (hanya mode add)
  const handleEntityTypeChange = (type: ApprovalType) => {
    setEntityType(type);
    if (mode === "add") setEntityId("");
    else setEntityId(getInitialId(type, initial));
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const fieldKey = entityFieldMap[entityType].key;
      const payload: ApprovalPostRequest = {
        entity_type: entityType,
        [fieldKey]: Number(entityId),
      };

      if (mode === "add") {
        await createApproval(payload);
      } else if (initial) {
        const updatePayload: ApprovalUpdateRequest = { ...payload, status };
        await updateApprovalStatus(initial.approval_id, updatePayload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Gagal menyimpan data approval";
      onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";
  const currentField = entityFieldMap[entityType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {mode === "add" ? "Tambah Approval" : "Edit Approval"}
        </h2>

        <div className="space-y-4">
          {/* Entity Type */}
          <div>
            <label className={labelClass}>Entity Type *</label>
            <select
              className={inputClass}
              value={entityType}
              onChange={(e) => handleEntityTypeChange(e.target.value as ApprovalType)}
            >
              {(["Quotation", "Purchase Order", "Invoice", "Expense"] as ApprovalType[]).map(
                (t) => <option key={t} value={t}>{t}</option>
              )}
            </select>
          </div>

          {/* ID field — dinamis sesuai entity type */}
          <div>
            <label className={labelClass}>{currentField.label} *</label>
            <input
              type="number"
              className={inputClass}
              placeholder={`Masukkan ${currentField.label}`}
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            />
          </div>

          {/* Status — hanya saat edit */}
          {mode === "edit" && (
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as ApprovalStatus)}
              >
                {(["New Request", "Approved", "Rejected"] as ApprovalStatus[]).map(
                  (s) => <option key={s} value={s}>{s}</option>
                )}
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !entityId}
            className="px-4 py-2 rounded-lg text-sm text-white bg-sky-500 hover:bg-sky-600 transition disabled:opacity-60"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState<ApprovalStatus>("New Request");
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Approval | null>(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, id: 0 });
  const [notifModal, setNotifModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // ── Fetch ───────────────────────────────────────────────────────────────────

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getApprovals();
      const data =
        response?.data?.list ||
        response?.data ||
        response ||
        [];
      setApprovals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Gagal memuat data Approval";
      setNotifModal({ open: true, title: "Gagal", message: msg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // ── Tab filter ──────────────────────────────────────────────────────────────

  const tabFilteredData = approvals.filter(
    (item) => (item.status ?? "New Request") === activeTab
  );

  // ── useTableFilters ─────────────────────────────────────────────────────────

  const {
    filters,
    search,
    currentPage,
    paginatedData,
    filteredData,
    totalPages,
    addFilter,
    removeFilter,
    updateFilterField,
    updateFilterValue,
    resetFilters,
    setSearch,
    setCurrentPage,
  } = useTableFilters(tabFilteredData, 5);

  const fieldOptions = [
    { label: "Type", value: "type" },
    { label: "Code", value: "code" },
    { label: "Quotation ID", value: "quotation_id" },
    { label: "PO ID", value: "po_id" },
    { label: "Invoice ID", value: "invoice_id" },
    { label: "Expense ID", value: "expense_id" },
  ];

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteApproval(confirmModal.id);
      setNotifModal({
        open: true,
        title: "Berhasil",
        message: "Approval berhasil dihapus",
        type: "success",
      });
      await fetchApprovals();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Gagal menghapus Approval";
      setNotifModal({ open: true, title: "Gagal", message: msg, type: "error" });
    } finally {
      setDeleting(false);
      setConfirmModal({ open: false, id: 0 });
    }
  };

  // ── Status badge color ──────────────────────────────────────────────────────

  const statusColor: Record<ApprovalStatus, string> = {
    "New Request": "bg-blue-100 text-blue-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Approvals</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-slate-900">Approvals</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-400 mb-4">
        <nav className="flex space-x-8 px-6 pt-4">
          {(["New Request", "Approved", "Rejected"] as ApprovalStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition ${activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-sky-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
            {filters.length > 0 && (
              <span className="bg-white text-sky-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                {filters.length}
              </span>
            )}
          </button>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari type atau code..."
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition"
        >
          + Add
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        show={showFilter}
        filters={filters}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onUpdateField={updateFilterField}
        onUpdateValue={updateFilterValue}
        onResetAll={resetFilters}
        fieldOptions={fieldOptions}
      />

      {/* Table */}
      <ResponsiveTable
        columns={[
          { header: 'Approval Type', accessor: 'approval_type', isPrimary: true },
          { header: 'ID', accessor: 'id', cellClassName: 'font-medium' },
          { header: 'Code', accessor: 'code' },
          { header: 'Quotation ID', accessor: 'quotation_id' },
          { header: 'PO ID', accessor: 'po_id' },
          { header: 'Invoice ID', accessor: 'invoice_id' },
          { header: 'Expense ID', accessor: 'expense_id' },
          { header: 'Leads ID', accessor: 'leads_id' },
          {
            header: 'Action',
            render: () => (
              <div className="flex gap-4">
                <button className="text-sky-500 hover:text-sky-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="text-red-500 hover:text-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ),
          },
        ]}
        data={paginatedData}
        keyAccessor={(item: any) => item.id}
        emptyState={search ? <EmptyState type="search" /> : <EmptyState title="No data found" />}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>

      {/* Form Modal — Add */ }
  <ApprovalFormModal
    isOpen={showAddModal}
    mode="add"
    onClose={() => setShowAddModal(false)}
    onSaved={() => {
      fetchApprovals();
      setNotifModal({
        open: true,
        title: "Berhasil",
        message: "Approval berhasil ditambahkan",
        type: "success",
      });
    }}
    onError={(msg) =>
      setNotifModal({ open: true, title: "Gagal", message: msg, type: "error" })
    }
  />

  {/* Form Modal — Edit */ }
  <ApprovalFormModal
    isOpen={!!editTarget}
    mode="edit"
    initial={editTarget ?? undefined}
    onClose={() => setEditTarget(null)}
    onSaved={() => {
      fetchApprovals();
      setEditTarget(null);
      setNotifModal({
        open: true,
        title: "Berhasil",
        message: "Approval berhasil diperbarui",
        type: "success",
      });
    }}
    onError={(msg) =>
      setNotifModal({ open: true, title: "Gagal", message: msg, type: "error" })
    }
  />

  {/* Confirmation Modal */ }
  <ConfirmationModal
    isOpen={confirmModal.open}
    title="Hapus Approval"
    message="Apakah Anda yakin ingin menghapus Approval ini? Tindakan ini tidak dapat dibatalkan."
    confirmText={deleting ? "Menghapus..." : "Hapus"}
    cancelText="Batal"
    type="reject"
    onConfirm={handleDeleteConfirm}
    onClose={() => setConfirmModal({ open: false, id: 0 })}
  />

  {/* Notification Modal */ }
  <NotificationModal
    isOpen={notifModal.open}
    title={notifModal.title}
    message={notifModal.message}
    type={notifModal.type}
    onClose={() =>
      setNotifModal({ open: false, title: "", message: "", type: "success" })
    }
  />
    </div >
  );
}