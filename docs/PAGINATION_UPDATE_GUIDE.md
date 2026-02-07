# Pagination Update Guide

## Files yang Perlu Diupdate

Berikut adalah daftar file yang menggunakan `useTableFilters` dan perlu diupdate untuk mendukung dynamic items per page:

### ✅ Sudah Terupdate
1. `/bizdev/partner-list/page.tsx` - ✅ Complete

### ⚠️ Perlu Update

1. `/bizdev/proposals/page.tsx`
2. `/bizdev/projects/page.tsx`
3. `/bizdev/contact-list/page.tsx`
4. `/bizdev/approvals/page.tsx`
5. `/bizdev/agreements/page.tsx`
6. `/operation/quotation/page.tsx`
7. `/human-resources/page.tsx`
8. `/finance/quotation/page.tsx`
9. `/finance/purchase/page.tsx`
10. `/finance/invoice/page.tsx`

## Update Steps untuk Setiap File

### Step 1: Update Destructuring dari useTableFilters

**Sebelum:**
```tsx
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
} = useTableFilters(data, 5)
```

**Sesudah - Tambahkan 2 baris:**
```tsx
const {
  filters,
  search,
  currentPage,
  itemsPerPage,        // ⭐ TAMBAHKAN
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
  setItemsPerPage,     // ⭐ TAMBAHKAN
} = useTableFilters(data, 5)
```

### Step 2: Update Pagination Component

**Sebelum:**
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredData.length}
  itemsPerPage={5}                // ❌ Hard-coded
  onPageChange={setCurrentPage}
/>
```

**Sesudah:**
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={filteredData.length}
  itemsPerPage={itemsPerPage}              // ✅ Dynamic
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}   // ✅ Handler
/>
```

## Quick Copy-Paste Snippets

### Destructuring (tambahkan di antara currentPage dan paginatedData):
```tsx
  itemsPerPage,
```

### Destructuring (tambahkan di antara setCurrentPage dan akhir object):
```tsx
  setItemsPerPage,
```

### Pagination props (replace itemsPerPage line):
```tsx
  itemsPerPage={itemsPerPage}
```

### Pagination props (tambahkan setelah onPageChange):
```tsx
  onItemsPerPageChange={setItemsPerPage}
```

## Verification Checklist

Untuk setiap file yang diupdate, pastikan:
- [ ] `itemsPerPage` ditambahkan dalam destructuring
- [ ] `setItemsPerPage` ditambahkan dalam destructuring
- [ ] `itemsPerPage={5}` diubah menjadi `itemsPerPage={itemsPerPage}`
- [ ] `onItemsPerPageChange={setItemsPerPage}` ditambahkan di Pagination component
- [ ] Default value di useTableFilters adalah `5`

## Expected Result

Setelah update, user akan melihat:
- Dropdown "Show [dropdown] entries" dengan pilihan: 5, 10, 25, 50, 100
- Data yang ditampilkan sesuai dengan pilihan dropdown
- Page reset ke 1 setiap kali items per page berubah
- Info "Showing X to Y of Z entries" yang akurat
