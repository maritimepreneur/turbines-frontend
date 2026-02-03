"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AbsentPage() {
  const pathname = usePathname()
  const [showFilter, setShowFilter] = useState(false)

  const tabs = [
    { label: "Recent Activity", href: "/human-resources/attendance/recent-activity" },
    { label: "Summary", href: "/human-resources/attendance/summary" },
    { label: "Absent", href: "/human-resources/attendance/absent" },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          HR / <span className="text-slate-600">Attendence</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Attendence</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 px-1 text-sm font-medium transition ${
              pathname === tab.href
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm border-t border-slate-200">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left py-3 px-3">Employee ID</th>
              <th className="text-left py-3 px-3">Employee Name</th>
              <th className="text-left py-3 px-3">Department</th>
              <th className="text-left py-3 px-3">Date</th>
              <th className="text-left py-3 px-3">Reason</th>
              <th className="text-left py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-slate-50 transition">
              <td className="py-3 px-3">EMP003</td>
              <td className="py-3 px-3">Mike Johnson</td>
              <td className="py-3 px-3">Finance</td>
              <td className="py-3 px-3">01 Dec 2025</td>
              <td className="py-3 px-3">Sick Leave</td>
              <td className="py-3 px-3">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Absent</span>
              </td>
            </tr>
            <tr className="border-b hover:bg-slate-50 transition">
              <td className="py-3 px-3">EMP005</td>
              <td className="py-3 px-3">Sarah Wilson</td>
              <td className="py-3 px-3">HR</td>
              <td className="py-3 px-3">30 Nov 2025</td>
              <td className="py-3 px-3">Personal Leave</td>
              <td className="py-3 px-3">
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Absent</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Row Per Page</span>
            <select className="border rounded px-2 py-1">
              <option>25</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span>Result: 1 - 2 of 2</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-50">First</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">Prev</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">Last</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}