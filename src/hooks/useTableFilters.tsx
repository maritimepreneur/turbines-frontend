"use client"

import { useState, useMemo, useEffect } from "react"
import { FilterItem } from "@/components/table/FilterPanel"

export function useTableFilters<T extends Record<string, any>>(
  data: T[],
  defaultItemsPerPage: number = 5
) {
  const [filters, setFilters] = useState<FilterItem[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filters])

  const addFilter = () => {
    const newFilter: FilterItem = {
      id: Date.now().toString(),
      field: Object.keys(data[0] || {})[0] || "",
      value: "",
    }
    setFilters([...filters, newFilter])
  }

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id))
  }

  const updateFilterField = (id: string, field: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, field, value: "" } : f)))
  }

  const updateFilterValue = (id: string, value: string) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, value } : f)))
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters([])
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset ke page 1 ketika items per page berubah
  }

  // Filter and sort data
  const filteredData = useMemo(() => {
    const result = data.filter((item) => {
      // Apply filters
      const matchFilters = filters.every((filter) => {
        if (!filter.value) return true
        return item[filter.field]
          ?.toString()
          .toLowerCase()
          .includes(filter.value.toLowerCase())
      })

      // Apply search
      const matchSearch = Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      )

      return matchFilters && matchSearch
    })

    // Urutkan sesuai abjad (A-Z)
    result.sort((a, b) => {
      const getVal = (x: any) =>
        (x.name || x.company_name || x.title || x.company || x.code || Object.values(x)[0] || "")
          .toString()
          .trim()
      return getVal(a).localeCompare(getVal(b), undefined, { sensitivity: "base", numeric: true })
    })

    return result
  }, [data, filters, search])

  // Pagination
  // totalPages minimal 1 jika ada data agar Pagination tidak hide selector-nya
  const totalPages = filteredData.length === 0 ? 0 : Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const paginatedData = useMemo(() => {
    // Jika itemsPerPage sangat besar (misal 99999 = All), kembalikan semua data
    if (itemsPerPage >= 99999) return filteredData
    return filteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
  }, [filteredData, currentPage, itemsPerPage])

  return {
    // States
    filters,
    search,
    currentPage,
    itemsPerPage,
    filteredData,
    paginatedData,
    totalPages,

    // Actions
    addFilter,
    removeFilter,
    updateFilterField,
    updateFilterValue,
    resetFilters,
    setSearch: handleSearchChange,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange,
  }
}