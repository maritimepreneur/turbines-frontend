"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react"
import axiosInstance from '@/lib/axios';
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { ResponsiveTable } from "@/components/table/ResponsiveTable"
import { EmptyState } from "@/components/table/EmptyState"
import { useTableFilters } from "@/hooks/useTableFilters"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { NotificationModal } from "@/components/modals/NotificationModal"

type Invoice = {
  id: string;
  number: string;
  period: string;
  due_date: string;
  total_amount: string;
  grand_total: string;
  partner_name: string;
  contact_name: string;
  po_number: string;
};

export default function PreInvoicePage() {
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false)
  const [invoicesData, setInvoicesData] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string } | null>(null)
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  })

  const handleEdit = (id: string) => {
    router.push(`/finance/invoice/invoice-form?id=${id}`)
  }

  const handleDeleteClick = (id: string, number: string) => {
    setInvoiceToDelete({ id, number })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return
    try {
      setIsDeleting(invoiceToDelete.id)
      await axiosInstance.delete(`/api/invoices/${invoiceToDelete.id}/`)
      setInvoicesData(prev => prev.filter(i => i.id !== invoiceToDelete.id))
      setNotification({
        isOpen: true,
        title: "Berhasil",
        message: `Invoice #${invoiceToDelete.number} berhasil dihapus.`,
        type: "success",
      })
    } catch (err: any) {
      setNotification({
        isOpen: true,
        title: "Gagal",
        message: err?.response?.data?.message || "Gagal menghapus invoice.",
        type: "error",
      })
    } finally {
      setIsDeleting(null)
      setShowDeleteModal(false)
      setInvoiceToDelete(null)
    }
  }

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axiosInstance.get('/api/invoices/');

        const raw = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const mappedData: Invoice[] = raw
          .map((item: any) => ({
            id: item.id?.toString() || "-",
            number: item.number?.toString() || "-",
            period: item.period || "-",
            due_date: item.due_date || "-",
            total_amount: item.total_amount || "0",
            grand_total: item.grand_total || "0",
            partner_name: item.partner_name || item.partner?.name || "-",
            contact_name: item.contact_name || item.contact?.name || "-",
            po_number: item.po_number || item.purchase_order?.po_number || "-",
          }));

        setInvoicesData(mappedData);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        setInvoicesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();

    const handleFocus = () => fetchInvoices();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const {
    filters,
    search,
    currentPage,
    itemsPerPage,
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
    setItemsPerPage,
  } = useTableFilters(invoicesData, 5)

  const fieldOptions = [
    { label: "Period", value: "invoice_period" },
    { label: "Name", value: "client_name" },
    { label: "Status", value: "status" },
  ]

  return (
    <div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Pre-Invoice"
        message={`Apakah kamu yakin ingin menghapus Invoice #${invoiceToDelete?.number}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="reject"
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Finance / <span className="text-slate-600">Pre-Invoice</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Pre-Invoice</h1>
      </div>

      <div className="border-b border-gray-400 mb-4">
        <nav className="flex space-x-8 px-6 pt-4">
          <Link href="/finance/pre-invoice">
            <button className="pb-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm transition">
              Pre Invoice
            </button>
          </Link>
          <Link href="/finance/invoice">
            <button className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition">
              Invoice
            </button>
          </Link>
          <Link href="/finance/canceled">
            <button className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition">
              Canceled
            </button>
          </Link>
        </nav>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-sky-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
            {filters.length > 0 && (
              <span className="bg-white text-sky-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                {filters.length}
              </span>
            )}
          </button>

          <SearchBar value={search} onChange={setSearch} placeholder="Search name or company..." />
        </div>

        <Link href="/finance/invoice/invoice-form">
          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition">
            + Add
          </button>
        </Link>
      </div>

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

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading data...</p>
            </div>
          </div>
        ) : (
          <ResponsiveTable<Invoice>
            columns={[
              {
                header: 'Number',
                accessor: 'number',
                isPrimary: true,
                render: (item) => (
                  <Link href={`/finance/invoice/invoice-form?id=${item.id}`} className="text-blue-500 hover:text-blue-700 hover:underline">
                    #{item.number}
                  </Link>
                ),
              },
              {
                header: 'Period',
                accessor: 'period',
              },
              {
                header: 'Due Date',
                accessor: 'due_date',
              },
              {
                header: 'Total Amount',
                render: (item) => `Rp ${parseFloat(item.total_amount).toLocaleString()}`,
              },
              {
                header: 'Grand Total',
                render: (item) => `Rp ${parseFloat(item.grand_total).toLocaleString()}`,
              },
              {
                header: 'Partner',
                accessor: 'partner_name',
              },
              {
                header: 'Contact',
                accessor: 'contact_name',
              },
              {
                header: 'PO Number',
                accessor: 'po_number',
              },
              {
                header: 'Action',
                render: (item) => (
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(item.id) }}
                      className="text-sky-500 hover:text-sky-700 transition"
                      title="Edit invoice"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(item.id, item.number) }}
                      disabled={isDeleting === item.id}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Hapus invoice"
                    >
                      {isDeleting === item.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ),
              },
            ]}
            data={paginatedData}
            keyAccessor={(item) => item.id}
            emptyState={
              search || filters.length > 0
                ? <EmptyState type="search" />
                : <EmptyState title="No pre-invoices found" description="Click '+ Add' to create a new pre-invoice" />
            }
          />
        )}

        {!loading && totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>
    </div>
  );
}
