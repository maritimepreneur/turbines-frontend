import React, { useState, useEffect, useRef } from 'react'

interface SearchableSelectProps {
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = ""
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Display Button (looks like select) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-white text-left ${className}`}
      >
        <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-black'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col max-h-60">
          <div className="p-2 border-b border-gray-100 bg-gray-50 shrink-0">
            <div className="relative">
              <input
                type="text"
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-black placeholder-gray-400"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <ul className="overflow-y-auto w-full py-1 custom-scrollbar text-black text-sm">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-gray-500 text-center text-sm">No results found</li>
            ) : (
              <>
                {/* Option to unselect (optional but helpful) */}
                <li
                  className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-gray-400 italic"
                  onClick={() => {
                    onChange("")
                    setIsOpen(false)
                    setSearch("")
                  }}
                >
                  — Clear selection —
                </li>
                {filteredOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      value === opt.value
                        ? 'bg-sky-50 text-sky-700 font-medium'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                      setSearch("")
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
