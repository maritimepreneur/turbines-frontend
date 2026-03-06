import React from "react";

interface EmptyStateProps {
    /** Type of empty state: "search" for no search results, "data" for no data */
    type?: "search" | "data";
    /** Title text */
    title?: string;
    /** Description text */
    description?: string;
    /** Custom icon (replaces default) */
    icon?: React.ReactNode;
}

const SearchIcon = () => (
    <svg
        className="w-12 h-12 mx-auto mb-3 text-slate-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
    </svg>
);

const InboxIcon = () => (
    <svg
        className="w-12 h-12 mx-auto mb-3 text-slate-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
    </svg>
);

export function EmptyState({
    type = "data",
    title,
    description,
    icon,
}: EmptyStateProps) {
    const defaultTitle =
        type === "search" ? "No results found" : "No data available";
    const defaultDescription =
        type === "search" ? "Try adjusting your search or filters" : undefined;

    return (
        <div className="text-center py-8">
            {icon || (type === "search" ? <SearchIcon /> : <InboxIcon />)}
            <p className="font-medium text-slate-800">{title || defaultTitle}</p>
            {(description || defaultDescription) && (
                <p className="text-sm text-slate-500 mt-1">{description || defaultDescription}</p>
            )}
        </div>
    );
}
