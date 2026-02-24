export interface FilterItem {
  id: string
  field: string
  value: string
}

interface FilterPanelProps {
  filters: FilterItem[]
  onAddFilter: () => void
  onRemoveFilter: (id: string) => void
  onUpdateField: (id: string, field: string) => void
  onUpdateValue: (id: string, value: string) => void
  onResetAll: () => void
  fieldOptions: { label: string; value: string }[]
  show: boolean
}

export function FilterPanel({
  filters,
  onAddFilter,
  onRemoveFilter,
  onUpdateField,
  onUpdateValue,
  onResetAll,
  fieldOptions,
  show,
}: FilterPanelProps) {
  if (!show) return null

  return (
    <div className="mb-4 p-4 border rounded-lg bg-slate-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">Active Filters</h3>
        <div className="flex gap-2 py-4">
          <button
            onClick={onAddFilter}
            className="bg-sky-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 hover:bg-sky-600 transition"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 26 26">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Filter
          </button>
          {filters.length > 0 && (
            <button
              onClick={onResetAll}
              className="text-sm text-red-600 hover:text-red-700 px-3 py-1"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {filters.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-2">
          No filters applied. Click "Add Filter" to start.
        </p>
      ) : (
        <div className="space-y-2 py-6">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-white p-2 rounded"
            >
              <select
                value={filter.field}
                onChange={(e) => onUpdateField(filter.id, e.target.value)}
                className="w-full sm:w-auto border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {fieldOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span className="text-slate-400 text-sm hidden sm:inline">contains</span>

              <input
                type="text"
                value={filter.value}
                onChange={(e) => onUpdateValue(filter.id, e.target.value)}
                placeholder="Enter value..."
                className="border border-slate-300 rounded px-3 py-2 text-sm w-full sm:flex-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <button
                onClick={() => onRemoveFilter(filter.id)}
                className="text-red-500 hover:text-red-700 px-2 self-end sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
