"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { Pagination } from "@/components/table/Pagination";
import { useTableFilters } from "@/hooks/useTableFilters";
import axiosInstance from "@/lib/axios";

type Lead = {
  number: string;
  name: string;
  projectname: string;
  total: string;
};

export default function QuotationPage() {
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState("Pending");
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);

        console.log("🚀 Fetching quotations via Axios...");

        // Gunakan axiosInstance yang sudah handle authentication
        const response = await axiosInstance.get('/api/quotations/');

        console.log("📦 Response:", response.data);

        // Validasi response
        if (!response.data || response.data.code !== 200) {
          console.error("❌ Invalid response code:", response.data?.code);
          throw new Error("Invalid API response");
        }

        if (!Array.isArray(response.data.data)) {
          console.error("❌ Data is not an array:", response.data.data);
          throw new Error("Invalid data format");
        }

        // Mapping data sesuai struktur API response
        const mappedData: Lead[] = response.data.data.map((item: any) => ({
          number: item.id?.toString() || "-",
          name: item.contact?.name || "-",
          projectname: item.lead?.name || "-",
          total: item.total_amount
            ? `Rp ${Number(item.total_amount).toLocaleString('id-ID')}`
            : "Rp 0",
        }));

        console.log("✅ Mapped data:", mappedData);
        console.log(`✅ Total items: ${mappedData.length}`);

        setLeadsData(mappedData);
      } catch (error: any) {
        console.error("❌ Error fetching quotations:", error);
        console.error("❌ Error details:", error.response?.data || error.message);
        setLeadsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
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
  } = useTableFilters(leadsData, 5);

  const fieldOptions = [
    { label: "Projectname", value: "projectname" },
    { label: "Name", value: "name" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Finance / <span className="text-slate-600">Quotation</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Quotation</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-400 mb-4">
        <nav className="flex space-x-8 px-6 pt-4">
          {["Pending", "New", "Approved", "Rejected"].map((tab) => (
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
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
            placeholder="Search name or company..."
          />
        </div>

        <Link href="/finance/quotation/quotation-form">
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

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        {/* Table */}
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">Number</th>
              <th className="text-left py-3 px-3">Name</th>
              <th className="text-left py-3 px-3">Project Name</th>
              <th className="text-left py-3 px-3">Total Amount</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading quotations...
                  </div>
                </td>
              </tr>
            )}

            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium">No quotations found</p>
                    <p className="text-xs mt-1">Click "+ Add" to create a new quotation</p>
                  </div>
                </td>
              </tr>
            )}

            {!loading && paginatedData.map((item) => (
              <tr
                key={item.number}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="py-3 px-3">
                  <Link
                    href={`/finance/quotation/quotation-form?number=${item.number}`}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    #{item.number}
                  </Link>
                </td>
                <td className="py-3 px-3 font-medium">{item.name}</td>
                <td className="py-3 px-3">{item.projectname}</td>
                <td className="py-3 px-3 font-semibold">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
    </div>
  );
}
