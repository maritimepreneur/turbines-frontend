"use client";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { Pagination } from "@/components/table/Pagination";
import { useTableFilters } from "@/hooks/useTableFilters";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrder";

type PurchaseOrderRow = {
  id: number;
  number: string;
  clientName: string;
  contactName: string;     // sekarang ambil dari contact.name
  summary: string;         // dari quotation.summary
  totalAmount: string;     // tidak ada di swagger → tampilkan "-"
  attachment: string | null;
  status: string;          // tidak ada di swagger → tampilkan "New"
};

export default function PurchaseOrderListPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState("New");

  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();

  // Map data sesuai field terbaru
  const mappedData: PurchaseOrderRow[] = (purchaseOrders || []).map((po) => {
    // Handle attachments safely (bisa string, array, atau null)
    let attachment: string | null = null;
    if (typeof po.attachments === "string") {
      attachment = po.attachments;
    } else if (Array.isArray(po.attachments) && po.attachments.length > 0) {
      attachment = po.attachments[0];
    }

    return {
      id: Number(po.id),
      number: po.number || `PO-${po.id}`,
      clientName: po.partner?.name || "-",
      contactName: po.contact?.name || "-",
      totalAmount: "-",
      summary: po.quotation?.summary || "-",
      attachment: attachment,
      status: po.status || "New",
    };
  });

  const tabFilteredData = mappedData.filter((item) => item.status === activeTab);

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
    { label: "PO Number", value: "number" },
    { label: "Client Name", value: "clientName" },
    { label: "Contact Name", value: "contactName" }, // ubah opsi filter
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Finance / <span className="text-slate-600">Purchase Order</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-slate-900">
          Purchase Order
        </h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-400 mb-4">
        <nav className="flex space-x-8 px-6 pt-4">
          {["New", "Pending", "Approved", "Rejected"].map((tab) => (
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
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
          <SearchBar value={search} onChange={setSearch} placeholder="Search number, client, or contact..." />
        </div>

        <Link href="/finance/purchase/purchase-form">
          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition">
            + Add
          </button>
        </Link>
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
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3 text-slate-900">Number</th>
              <th className="text-left py-3 px-3 text-slate-900">Client Name</th>
              <th className="text-left py-3 px-3 text-slate-900">Contact Name</th>
              <th className="text-left py-3 px-3 text-slate-900">Summary</th>
              <th className="text-left py-3 px-3 text-slate-900">Doc</th>
              <th className="text-left py-3 px-3 text-slate-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">Loading...</td>
              </tr>
            )}
            {!isLoading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-slate-400">No data found</td>
              </tr>
            )}
            {paginatedData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50 transition">
                <td className="py-3 px-3">
                  <Link
                    href={`/finance/purchase/purchase-form?id=${item.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {item.number}
                  </Link>
                </td>
                <td className="py-3 px-3 font-medium text-slate-900">{item.clientName}</td>
                <td className="py-3 px-3 text-slate-900">{item.contactName}</td>
                <td className="py-3 px-3 text-slate-900">{item.summary}</td>
                <td className="py-3 px-3">
                  {item.attachment ? (
                    <button
                      onClick={() => window.open(item.attachment!, "_blank")}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="View Document"
                    >
                      <FontAwesomeIcon icon={faFilePdf} size="lg" />
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={5}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}