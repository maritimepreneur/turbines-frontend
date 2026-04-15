"use client"

import React from "react"

export interface TableColumn<T> {
    /** Header label */
    header: string
    /** Key to access cell data, or render function */
    accessor?: keyof T
    /** Custom render function for cell content */
    render?: (item: T, index: number) => React.ReactNode
    /** Whether to show this column in mobile card view (default: true) */
    showOnMobile?: boolean
    /** Whether this is the primary/title field shown prominently on mobile card */
    isPrimary?: boolean
    /** Header cell className override */
    headerClassName?: string
    /** Body cell className override */
    cellClassName?: string
    /** Whether the header & cell should use whitespace-nowrap */
    nowrap?: boolean
}

interface ResponsiveTableProps<T> {
    columns: TableColumn<T>[]
    data: T[]
    /** Unique key accessor for each row */
    keyAccessor: (item: T) => string | number
    /** Empty state content */
    emptyState?: React.ReactNode
    /** Whether to show border-t on table */
    showTopBorder?: boolean
    /** Row click handler */
    onRowClick?: (item: T) => void
    /** Custom row className */
    rowClassName?: (item: T, index: number) => string
}

export function ResponsiveTable<T>({
    columns,
    data,
    keyAccessor,
    emptyState,
    showTopBorder = true,
    onRowClick,
    rowClassName,
}: ResponsiveTableProps<T>) {
    const getCellContent = (col: TableColumn<T>, item: T, index: number) => {
        if (col.render) return col.render(item, index)
        if (col.accessor) {
            const value = item[col.accessor]
            if (value === null || value === undefined || value === "") {
                return <span className="text-slate-400 text-xs">-</span>
            }
            return String(value)
        }
        return null
    }

    const mobileColumns = columns.filter((col) => col.showOnMobile !== false)
    const primaryCol = columns.find((col) => col.isPrimary)
    const actionCol = columns.find(
        (col) => col.header.toLowerCase() === "action"
    )
    const detailCols = mobileColumns.filter(
        (col) => !col.isPrimary && col.header.toLowerCase() !== "action"
    )

    return (
        <>
            {/* ====== DESKTOP TABLE (hidden on mobile) ====== */}
            <div className="hidden md:block overflow-x-auto">
                <table
                    className={`w-full text-sm ${showTopBorder ? "border-t border-slate-200" : ""}`}
                >
                    <thead className="bg-slate-50">
                        <tr className="border-b border-slate-200">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`text-left py-3 px-3 text-slate-500 font-semibold ${col.nowrap !== false ? "whitespace-nowrap" : ""} ${col.headerClassName || ""}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-8 text-slate-400"
                                >
                                    {emptyState || "No data found"}
                                </td>
                            </tr>
                        )}
                        {data.map((item, index) => (
                            <tr
                                key={keyAccessor(item)}
                                className={`border-b border-slate-200 hover:bg-slate-50 transition ${onRowClick ? "cursor-pointer" : ""} ${rowClassName ? rowClassName(item, index) : ""}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((col, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`py-3 px-3 ${col.cellClassName || ""}`}
                                    >
                                        {getCellContent(col, item, index)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ====== MOBILE CARD VIEW (shown only on mobile) ====== */}
            <div className="md:hidden">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border-t border-slate-200">
                        {emptyState || "No data found"}
                    </div>
                ) : (
                    <div className="space-y-3 pt-3">
                        {data.map((item, index) => (
                            <div
                                key={keyAccessor(item)}
                                className={`border border-slate-200 rounded-lg p-3 bg-white hover:shadow-sm transition ${onRowClick ? "cursor-pointer" : ""}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {/* Card Header: Primary field + Action */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        {primaryCol && (
                                            <div className="font-semibold text-sm text-slate-900 truncate">
                                                {getCellContent(primaryCol, item, index)}
                                            </div>
                                        )}
                                    </div>
                                    {actionCol && (
                                        <div className="shrink-0">
                                            {getCellContent(actionCol, item, index)}
                                        </div>
                                    )}
                                </div>

                                {/* Card Body: Detail fields in 2-col grid */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                                    {detailCols.map((col, colIndex) => (
                                        <div key={colIndex} className="min-w-0">
                                            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                                {col.header}
                                            </div>
                                            <div className="text-xs text-slate-700 truncate">
                                                {getCellContent(col, item, index)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
