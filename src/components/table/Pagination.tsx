import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isCompact = false,
}: PaginationProps & { isCompact?: boolean }) {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers dengan smart pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7; // Jumlah maksimal page numbers yang ditampilkan

    if (totalPages <= maxPagesToShow) {
      // Jika total pages sedikit, tampilkan semua
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Selalu tampilkan page 1
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Tampilkan pages di sekitar current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Selalu tampilkan page terakhir
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col ${isCompact ? 'items-center gap-3' : 'sm:flex-row justify-between items-center gap-4'} mt-6 pt-4 border-t border-slate-200`}>
      {/* Items per page selector */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-600">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
          className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-slate-600">entries</span>
      </div>

      {/* Page info */}
      <p className={`text-sm text-slate-600 ${isCompact ? 'text-center' : 'text-center order-last sm:order-none w-full sm:w-auto'}`}>
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span> entries
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 hover:border-sky-400 transition"
          title="First page"
        >
          <ChevronsLeft size={16} className="text-slate-600" />
        </button>

        {/* Previous page button */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 hover:border-sky-400 transition text-sm font-medium text-slate-700"
        >
          <div className="flex items-center gap-1">
            <ChevronLeft size={16} />
            <span>Prev</span>
          </div>
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-slate-500"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[40px] px-3 py-2 border rounded-lg transition text-sm font-medium ${currentPage === page
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                  : 'border-slate-300 text-slate-700 hover:bg-sky-50 hover:border-sky-400'
                  }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile: Current page indicator */}
        <div className="sm:hidden px-3 py-2 text-sm font-medium text-slate-700">
          {currentPage} / {totalPages}
        </div>

        {/* Next page button */}
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 hover:border-sky-400 transition text-sm font-medium text-slate-700"
        >
          <div className="flex items-center gap-1">
            <span>Next</span>
            <ChevronRight size={16} />
          </div>
        </button>

        {/* Last page button */}
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(totalPages)}
          className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 hover:border-sky-400 transition"
          title="Last page"
        >
          <ChevronsRight size={16} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
}