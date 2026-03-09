"use client"

import { useEffect, useState } from "react"

interface GFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (gform: {
    name: string
    url: string
    batch: string
    date: string
    type: string
  }) => void
  gform?: {
    id: number
    name: string
    url: string
    batch: string
    date: string
    type: string
  } | null
}

export function GFormModal({ isOpen, onClose, onSave, gform }: GFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    batch: "",
    date: "",
    type: "Foundation"
  })

  useEffect(() => {
    if (gform) {
      setFormData({
        name: gform.name,
        url: gform.url,
        batch: gform.batch,
        date: gform.date,
        type: gform.type
      })
    } else {
      setFormData({
        name: "",
        url: "",
        batch: "",
        date: "",
        type: "Foundation"
      })
    }
  }, [gform, isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              {gform ? "Edit Google Form" : "Add Google Form"}
            </h2>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter form name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                URL (Logo Link) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="https://forms.google.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Batch <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., Batch 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Foundation">Foundation</option>
                <option value="Specialization">Specialization</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition"
            >
              {gform ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
