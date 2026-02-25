"use client"
import Link from "next/link";
import { useState, useEffect } from "react"
import Cookies from 'js-cookie';
import { SearchBar } from "@/components/table/SearchBar"
import { FilterPanel } from "@/components/table/FilterPanel"
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"

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
  const [showFilter, setShowFilter] = useState(false)
  const [invoicesData, setInvoicesData] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = Cookies.get('access_token');
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          console.error('API Error:', response.status, response.statusText);
          setInvoicesData([]);
          return;
        }

        const result = await response.json();

        const mappedData: Invoice[] = result.data
          .filter((item: any) => item.status === 'Pre Invoice')
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

      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">Number</th>
              <th className="text-left py-3 px-3">Period</th>
              <th className="text-left py-3 px-3">Due Date</th>
              <th className="text-left py-3 px-3">Total Amount</th>
              <th className="text-left py-3 px-3">Grand Total</th>
              <th className="text-left py-3 px-3">Partner</th>
              <th className="text-left py-3 px-3">Contact</th>
              <th className="text-left py-3 px-3">PO Number</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-slate-400">
                  No data found
                </td>
              </tr>
            )}

            {paginatedData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50 transition">
                <td className="py-3 px-3">
                  <Link href={`/finance/invoice/invoice-form?id=${item.id}`} className="text-blue-500 hover:text-blue-700">
                    #{item.number}
                  </Link>
                </td>
                <td className="py-3 px-3">{item.period}</td>
                <td className="py-3 px-3">{item.due_date}</td>
                <td className="py-3 px-3">Rp {parseFloat(item.total_amount).toLocaleString()}</td>
                <td className="py-3 px-3">Rp {parseFloat(item.grand_total).toLocaleString()}</td>
                <td className="py-3 px-3">{item.partner_name}</td>
                <td className="py-3 px-3">{item.contact_name}</td>
                <td className="py-3 px-3">{item.po_number}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
}
