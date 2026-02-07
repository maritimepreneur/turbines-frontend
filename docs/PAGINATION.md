# Pagination Component Documentation

## Overview
Enhanced pagination component with items per page selector, smart page number display, and improved UX.

## Features
- ✅ Dynamic items per page selection (10, 25, 50, 100)
- ✅ Smart page number display with ellipsis for large page counts
- ✅ First/Last page navigation buttons
- ✅ Mobile responsive design
- ✅ Modern styling with hover states
- ✅ Accessible and keyboard-friendly

## Props

```typescript
interface PaginationProps {
  currentPage: number;              // Current active page (1-indexed)
  totalPages: number;                // Total number of pages
  totalItems: number;                // Total number of items across all pages
  itemsPerPage: number;              // Current items per page setting
  onPageChange: (page: number) => void;                    // Callback when page changes
  onItemsPerPageChange?: (itemsPerPage: number) => void;  // Optional callback for items per page change
}
```

## Usage Example

### Basic Usage with useTableFilters Hook

```tsx
import { Pagination } from "@/components/table/Pagination";
import { useTableFilters } from "@/hooks/useTableFilters";

export default function MyPage() {
  const { data } = useMyData(); // Your data fetching hook

  const {
    currentPage,
    itemsPerPage,
    paginatedData,
    filteredData,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
  } = useTableFilters(data, 10); // 10 is default items per page

  return (
    <div>
      {/* Your table/list */}
      <table>
        {paginatedData.map(item => (
          <tr key={item.id}>...</tr>
        ))}
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
  );
}
```

### Manual Usage (without useTableFilters)

```tsx
import { useState } from "react";
import { Pagination } from "@/components/table/Pagination";

export default function ManualPaginationExample() {
  const data = [...]; // Your data
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      {/* Your content */}
      {paginatedData.map(item => <div key={item.id}>{item.name}</div>)}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={data.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
```

## Smart Page Display Logic

The pagination automatically handles large page counts:

- **Few pages (≤7)**: Shows all page numbers
  ```
  [First] [Prev] [1] [2] [3] [4] [5] [Next] [Last]
  ```

- **Many pages, near start**:
  ```
  [First] [Prev] [1] [2] [3] [...] [50] [Next] [Last]
  ```

- **Many pages, in middle**:
  ```
  [First] [Prev] [1] [...] [24] [25] [26] [...] [50] [Next] [Last]
  ```

- **Many pages, near end**:
  ```
  [First] [Prev] [1] [...] [48] [49] [50] [Next] [Last]
  ```

## Mobile Responsive

On mobile devices (< 640px):
- Page numbers are hidden
- Shows current page indicator: "5 / 20"
- Navigation buttons remain visible

## Styling

The component uses Tailwind CSS with custom classes:
- Primary color: `sky-500` (can be customized)
- Hover states on all interactive elements
- Disabled states for first/last page buttons
- Border and shadow effects for better UX

## Migration Guide

### From Old Pagination

**Before:**
```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={data.length}
  itemsPerPage={5}  // ❌ Hard-coded
  onPageChange={setCurrentPage}
/>
```

**After:**
```tsx
const { itemsPerPage, setItemsPerPage } = useTableFilters(data, 10);

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={data.length}
  itemsPerPage={itemsPerPage}  // ✅ Dynamic
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}  // ✅ Added
/>
```

### Update useTableFilters Hook Call

**Before:**
```tsx
const { currentPage, setCurrentPage } = useTableFilters(data, 5);
```

**After:**
```tsx
const { 
  currentPage, 
  itemsPerPage,      // ✅ Add this
  setCurrentPage,
  setItemsPerPage    // ✅ Add this
} = useTableFilters(data, 10);  // Default items per page
```

## Notes

- The `onItemsPerPageChange` prop is **optional** for backward compatibility
- If not provided, the items per page dropdown will still show but won't function
- When items per page changes, the current page automatically resets to 1
