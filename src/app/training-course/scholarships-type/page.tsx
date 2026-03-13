"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchBar } from "@/components/table/SearchBar";
import { Pagination } from "@/components/table/Pagination";
import { ResponsiveTable } from "@/components/table/ResponsiveTable";
import { EmptyState } from "@/components/table/EmptyState";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useScholarshipList } from "@/hooks/useScholarshipList";

export default function ScholarshipTypePage() {
  const [showFilter, setShowFilter] = useState(false);

  const {
    scholarshipData,
    loading,
    fetchScholarships,
  } = useScholarshipList();

  const {
    search,
    currentPage,
    itemsPerPage,
    paginatedData,
    filteredData,
    totalPages,
    setSearch,
    setCurrentPage,
    setItemsPerPage,
  } = useTableFilters(scholarshipData, 5);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Training Course / <span className="text-slate-600">Scholarship Type</span>
        </p>

        <h1 className="text-2xl font-semibold mt-1 text-black">
          Scholarship Type
        </h1>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-4">
        <div className="text-sm text-gray-600">
          Total:
          <span className="font-semibold text-gray-800 ml-1">
            {filteredData.length}
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">

        {/* Toolbar */}
        <div className="flex justify-between mb-4">

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search scholarship..."
          />

          <div className="flex gap-3">

            <button
              onClick={fetchScholarships}
              className="bg-gray-100 px-4 py-2 rounded-lg"
            >
              Refresh
            </button>

            {/* LINK KE FORM */}
            <Link
              href="/training-course/scholarship-type/scholarshipType-form"
              className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600"
            >
              + Add
            </Link>

          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-10">
            Loading data...
          </div>
        ) : (
          <ResponsiveTable<any>
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Type", accessor: "type" },
              { header: "Category", accessor: "category" },
              { header: "Original Price", accessor: "original_price" },
              { header: "Discount", accessor: "discount" },
              { header: "Price", accessor: "price" },
              { header: "Status", accessor: "status" },
            ]}
            data={paginatedData}
            keyAccessor={(item) => item.scholarship_id}
            emptyState={
              <EmptyState
                title="No scholarship found"
                description="Click '+ Add' to create scholarship"
              />
            }
          />
        )}

        {/* Pagination */}
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