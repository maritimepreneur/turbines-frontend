"use client";
import Link from "next/link";
import { useState } from "react";
import { SearchBar } from "@/components/table/SearchBar";
import { FilterPanel } from "@/components/table/FilterPanel";
import { Pagination } from "@/components/table/Pagination";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useQuotationList } from "@/hooks/useQuotationList";

export default function QuotationPage() {
  const [showFilter, setShowFilter] = useState(false);
  const {
    leadsData,
    loading,
    isDeleting,
    deleteModal,
    notifModal,
    fetchQuotations,
    handleEdit,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
    closeNotifModal,
  } = useQuotationList();


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
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Quotation</h3>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete quotation #{deleteModal.id}? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notifModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                notifModal.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {notifModal.type === 'success' ? (
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {notifModal.type === 'success' ? 'Success!' : 'Error!'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">{notifModal.message}</p>
              <button
                onClick={closeNotifModal}
                className={`w-full px-4 py-2 rounded-lg transition font-medium text-white ${
                  notifModal.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Finance / <span className="text-slate-600">Quotation</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Quotation</h1>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-4">
        <div className="text-xs sm:text-sm text-gray-600">
          Total:{" "}
          <span className="font-semibold text-gray-800">
            {filteredData.length}
          </span>{" "}
          Quotation
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-6 text-black">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="bg-sky-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-sky-600 transition"
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
              <span className="hidden sm:inline">Filter</span>
              {filters.length > 0 && (
                <span className="bg-white text-sky-500 rounded-full px-2 py-0.5 text-xs font-semibold">
                  {filters.length}
                </span>
              )}
            </button>

            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search..."
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchQuotations}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 hover:bg-gray-200 transition disabled:opacity-50"
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
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link href="/finance/quotation/quotation-form">
              <button className="bg-sky-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-sky-600 transition whitespace-nowrap">
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
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm border-t border-slate-200">
            <thead className="bg-slate-50">
              <tr className="border-b">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                  Number
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                  Name
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap hidden md:table-cell">
                  Project Name
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                  Total
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && paginatedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-8 sm:w-12 h-8 sm:h-12 text-slate-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="font-medium text-xs sm:text-sm">
                        No quotations found
                      </p>
                      <p className="text-xs mt-1">Click "+ Add" to create</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedData.map((item) => (
                  <tr
                    key={item.number}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <Link
                        href={`/finance/quotation/quotation-form?number=${item.number}`}
                        className="text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap"
                      >
                        #{item.number}
                      </Link>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium">
                      {item.name}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 hidden md:table-cell">
                      {item.projectname}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3 whitespace-nowrap">
                      {item.total}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-3">
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={() => handleEdit(item.number)}
                          className="text-sky-500 hover:text-sky-700 transition"
                          title="Edit quotation"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

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