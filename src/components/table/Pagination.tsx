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
  // Guard: totalPages minimal 1 jika ada data, agar tidak terjadi pembagian 0
  const safeTotalPages = totalItems > 0 ? Math.max(1, totalPages) : 0;
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Jika tidak ada data sama sekali, jangan tampilkan pagination
  if (totalItems === 0) return null;

  // Generate page numbers dengan smart pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (safeTotalPages <= maxPagesToShow) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(safeTotalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < safeTotalPages - 2) {
      pages.push('...');
    }

    if (safeTotalPages > 1) {
      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col ${isCompact ? 'items-center gap-3' : 'sm:flex-row justify-between items-center gap-3 sm:gap-4'} mt-4 sm:mt-6 pt-4 border-t border-slate-200`}>
      {/* Items per page selector — selalu tampil agar user bisa ganti jumlah item */}
      <div className="flex items-center gap-2 sm:gap-3 text-sm">
        <span className="text-slate-600">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            // 99999 sebagai representasi 'All'
            onItemsPerPageChange?.(Number(e.target.value));
          }}
          className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-700 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={99999}>All</option>
        </select>
        <span className="text-slate-600">entries</span>
      </div>

      {/* Page info */}
      <p className={`text-sm text-slate-600 ${isCompact ? 'text-center' : 'text-center order-last sm:order-none w-full sm:w-auto'}`}>
        Showing <span className="font-semibold text-slate-900">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-900">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-900">{totalItems}</span> entries
      </p>

      {/* Pagination controls — sembunyikan jika hanya 1 halaman */}
      {safeTotalPages > 1 && (
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
              <span className="hidden sm:inline">Prev</span>
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
            {currentPage} / {safeTotalPages}
          </div>

          {/* Next page button */}
          <button
            disabled={currentPage === safeTotalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 hover:border-sky-400 transition text-sm font-medium text-slate-700"
          >
            <div className="flex items-center gap-1">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </div>
          </button>

          {/* Last page button */}
          <button
            disabled={currentPage === safeTotalPages}
            onClick={() => onPageChange(safeTotalPages)}
            className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sky-50 hover:border-sky-400 transition"
            title="Last page"
          >
            <ChevronsRight size={16} className="text-slate-600" />
          </button>
        </div>
      )}
    </div>
  );
}