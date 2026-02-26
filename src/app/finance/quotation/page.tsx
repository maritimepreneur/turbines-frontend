"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewLeadsPage() {
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      console.log("🚀 Fetching quotations via Axios...");
      const response = await axiosInstance.get('/api/quotations/');
      console.log("📦 Response:", response.data);

      if (!response.data || response.data.code !== 200) {
        console.error("❌ Invalid response code:", response.data?.code);
        throw new Error("Invalid API response");
      }

      if (!Array.isArray(response.data.data)) {
        console.error("❌ Data is not an array:", response.data.data);
        throw new Error("Invalid data format");
      }

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

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleEdit = (quotationId: string) => {
    router.push(`/finance/quotation/quotation-form?number=${quotationId}`);
  };

  const handleDelete = async (quotationId: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete quotation #${quotationId}?`
    );
    
    if (!confirmDelete) return;

    try {
      setIsDeleting(quotationId);
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/quotations/${quotationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete quotation");
      }

      alert("Quotation deleted successfully!");
      await fetchQuotations();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      alert("Failed to delete quotation. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };


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

      {/* Total */}
      <div className="flex justify-end mb-4">
        <div className="text-sm text-gray-600">
          Total:{" "}
          <span className="font-semibold text-gray-800">
            {filteredData.length}
          </span>{" "}
          Quotation
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
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

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuotations}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200 transition disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <Link href="/finance/quotation/quotation-form">
              <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition">
                + Add
              </button>
            </Link>
          </div>
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
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">Number</th>
              <th className="text-left py-3 px-3">Name</th>
              <th className="text-left py-3 px-3">Project Name</th>
              <th className="text-left py-3 px-3">Total Amount</th>
              <th className="text-left py-3 px-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-400">
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
                <td className="py-3 px-3">{item.total}</td>
                <td className="py-3 px-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item.number)}
                      className="text-sky-500 hover:text-sky-700 transition"
                      title="Edit quotation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.number)}
                      disabled={isDeleting === item.number}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete quotation"
                    >
                      {isDeleting === item.number ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
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
