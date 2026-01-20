'use client';

import { useState } from 'react';
import { Pagination } from "@/components/table/Pagination"
import { useTableFilters } from "@/hooks/useTableFilters"

export default function PipelinesPage() {
  const [selectedLead, setSelectedLead] = useState('Pt Mahakarya');
  const [activeTab, setActiveTab] = useState('General Info');

  const stages = ['New lead', 'Introduction', 'Presentation', 'Quotation', 'Follow Up', 'MoU', 'Execution'];
  const leads = [
    { name: 'Pt Mahakarya', date: '12-10-2025' },
    { name: 'Pt Indofood', date: '12-10-2025' },
    { name: 'Pt Logistics', date: '12-10-2025' }
  ];
  const {

      currentPage,
      paginatedData,
      filteredData,
      totalPages,
      setCurrentPage,
    } = useTableFilters(leads, 5)
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Pipelines</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">
          Pipelines
        </h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Stage Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {stages.map((stage) => (
            <button
              key={stage}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
                stage === 'New lead'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={stage === 'New lead' ? { backgroundColor: '#00A6FB' } : {}}
            >
              {stage}
            </button>
          ))}
        </div>

        {/* Search and Add Button */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name or company..."
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Lead Cards */}
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-3">
              {/* Add New Lead Button */}
              <div className="flex justify-center">
                <button className="px-6 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2" style={{ backgroundColor: '#00A6FB' }}>
                  + Add New Lead
                </button>
              </div>

              {leads.map((lead) => (
                <div
                  key={lead.name}
                  onClick={() => setSelectedLead(lead.name)}
                  className={`p-4 rounded-lg cursor-pointer flex items-center justify-between ${
                    selectedLead === lead.name
                      ? 'text-white'
                      : 'bg-gray-50 text-gray-800'
                  }`}
                  style={selectedLead === lead.name ? { backgroundColor: '#00A6FB' } : {}}
                >
                  <div>
                    <h3 className="font-semibold">{lead.name}</h3>
                    <p className="text-sm mt-1 opacity-80">📅 {lead.date}</p>
                  </div>
                  <button className="text-red-500 hover:text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredData.length}
                      itemsPerPage={5}
                      onPageChange={setCurrentPage}
                    />
          </div>

          {/* Right: Detail Form */}
          <div className="col-span-2 space-y-6">
            {/* Top Card: Stage, Status, Cancel Reason */}
            <div className="border rounded-lg p-6 bg-white">
              {/* Stage and Status */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-gray-600 block mb-2">STAGE</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>New lead</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-2">STATUS</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Cold lead</option>
                  </select>
                </div>
              </div>

              {/* Cancel Reason */}
              <div>
                <label className="text-sm text-gray-600 block mb-2">CANCEL REASON</label>
                <select className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option>None</option>
                </select>
              </div>
            </div>

            {/* Bottom Card: Tabs and Form */}
            <div className="border rounded-lg p-6 bg-white">

              {/* Tabs */}
              <div className="flex gap-6 border-b mb-6">
              {['General Info', 'Quotation', 'Purchase Order', 'Invoice'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm ${
                    activeTab === tab
                      ? 'border-b-2'
                      : 'text-gray-500'
                  }`}
                  style={activeTab === tab ? { color: '#00A6FB', borderColor: '#00A6FB' } : {}}
                >
                  {tab}
                </button>
              ))}
              </div>

              {/* General Info Form */}
              {activeTab === 'General Info' && (
                <div className="space-y-4">
                {/* Company Info */}
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Company Name</label>
                  <input
                    type="text"
                    value="Pt Mahakarya"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Company Initial</label>
                  <input
                    type="text"
                    placeholder="Enter initial..."
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Company Type</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm text-gray-400">
                    <option>Select type...</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-2">Company Industry</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm text-gray-400">
                    <option>Select industry...</option>
                  </select>
                </div>

                {/* Contact Details */}
                <div className="pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    👤 CONTACT DETAILS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Role</label>
                      <select className="w-full px-3 py-2 border rounded-lg text-sm text-gray-400">
                        <option>Select role...</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Name</label>
                      <input
                        type="text"
                        placeholder="Full name"
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="email@company.com"
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 block mb-2">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+62..."
                        className="w-full px-3 py-2 border rounded-lg text-sm text-gray-400"
                      />
                    </div>

                    {/* Attachment and Log History */}
                    <div className="flex justify-between items-center pt-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        Attachment +
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        Log History & Comments
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-3 pt-6">
                  <button className="text-white px-6 py-2 rounded-lg" style={{ backgroundColor: '#00A6FB' }}>
                    Submit
                  </button>
                  <button className="text-gray-700 px-6 py-2 border rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
