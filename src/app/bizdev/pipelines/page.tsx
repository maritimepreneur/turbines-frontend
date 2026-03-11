'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pagination } from "@/components/table/Pagination";
import { EmptyState } from "@/components/table/EmptyState";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { NotificationModal } from "@/components/modals/NotificationModal";
import GeneralInfo from "@/components/pipelines/GeneralInfo";
import Quotation from "@/components/pipelines/Quotation";
import PurchaseOrder from "@/components/pipelines/PurchaseOrder";
import Invoice from "@/components/pipelines/Invoice";
import axiosInstance from "@/lib/axios";
import { useRouter } from 'next/navigation';

type Lead = {
  id: number
  name: string
  period: string
  description: string
  contact_id: number | null
  partner_id: number
  current_stages: string
  contact_name: string | null
  company: string | null
  partner_name: string
}

interface LeadsResponse {
  message: string
  code: number
  data: {
    list: Lead[]
    pagination: {
      current_page: number
      page_size: number
      total_pages: number
      total_items: number
    }
  }
}

export default function PipelinesPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [activeTab, setActiveTab] = useState('General Info')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStage, setActiveStage] = useState('New lead')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const stageMapping: Record<string, string> = {
    'NEW': 'New lead',
    'INTRODUCTION': 'Introduction',
    'PRESENTATION': 'Presentation',
    'QUOTATION': 'Quotation',
    'FU': 'Follow Up',
    'MOU': 'MoU',
    'EXECUTION': 'Execution',
  }

  const reverseStageMapping: Record<string, string> = {
    'New lead': 'NEW',
    'Introduction': 'INTRODUCTION',
    'Presentation': 'PRESENTATION',
    'Quotation': 'QUOTATION',
    'Follow Up': 'FU',
    'MoU': 'MOU',
    'Execution': 'EXECUTION',
  }

  const stages = ['New lead', 'Introduction', 'Presentation', 'Quotation', 'Follow Up', 'MoU', 'Execution']

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('📥 Fetching pipelines data...')

      const response = await axiosInstance.post<LeadsResponse>(
        '/api/leads/',
        {
          page_number: 1,
          page_size: 1000,
          sort_by: 'id',
          sort_order: 'DESC',
        }
      )

      if (response.data.code === 200) {
        console.log('✅ Pipelines data fetched:', response.data.data.list.length)
        const leadsData = response.data.data.list
        setLeads(leadsData)

        if (!selectedLead && leadsData.length > 0) {
          const apiStage = reverseStageMapping[activeStage]
          const stageLeads = leadsData.filter(l => l.current_stages === apiStage)
          if (stageLeads.length > 0) {
            setSelectedLead(stageLeads[0])
          } else {
            setSelectedLead(leadsData[0])
            setActiveStage(stageMapping[leadsData[0].current_stages] || 'New lead')
          }
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch pipelines')
      }
    } catch (err: any) {
      console.error('❌ Error fetching pipelines:', err)
      setError('Failed to load pipelines data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Modals state
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: "success" | "error" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  })

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    leadId: number | null
  }>({
    isOpen: false,
    leadId: null
  })

  // ... (rest of the state variables remain the same)

  // ... (fetchLeads remains the same)

  const updateLeadStage = async (leadId: number, newStage: string) => {
    try {
      setIsUpdating(true)
      console.log('📤 Updating lead stage...', leadId, newStage)

      const apiStage = reverseStageMapping[newStage] || newStage

      const response = await axiosInstance.put(`/api/leads/${leadId}`, {
        current_stages: apiStage
      })

      if (response.data.code === 200) {
        console.log('✅ Lead stage updated')

        setLeads(prev => prev.map(lead =>
          lead.id === leadId
            ? { ...lead, current_stages: apiStage }
            : lead
        ))

        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, current_stages: apiStage } : null)
        }

        setNotification({
          isOpen: true,
          title: "Success",
          message: "Stage updated successfully!",
          type: "success"
        })
      }
    } catch (err: any) {
      console.error('❌ Error updating stage:', err)
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || err.message || "Failed to update stage",
        type: "error"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteClick = (leadId: number) => {
    setDeleteConfirmation({
      isOpen: true,
      leadId: leadId
    })
  }

  const confirmDelete = async () => {
    const leadId = deleteConfirmation.leadId
    if (!leadId) return

    try {
      console.log('🗑️ Deleting lead:', leadId)
      const response = await axiosInstance.delete(`/api/leads/${leadId}`)

      if (response.data.code === 200) {
        console.log('✅ Lead deleted')

        const newLeads = leads.filter(lead => lead.id !== leadId)
        setLeads(newLeads)

        if (selectedLead?.id === leadId) {
          const apiStage = reverseStageMapping[activeStage]
          const stageLeads = newLeads.filter(l => l.current_stages === apiStage)
          setSelectedLead(stageLeads[0] || null)
        }

        setNotification({
          isOpen: true,
          title: "Success",
          message: "Lead deleted successfully!",
          type: "success"
        })
      }
    } catch (err: any) {
      console.error('❌ Error deleting lead:', err)
      setNotification({
        isOpen: true,
        title: "Error",
        message: err.response?.data?.message || err.message || "Failed to delete lead",
        type: "error"
      })
    } finally {
      setDeleteConfirmation({ isOpen: false, leadId: null })
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const filteredLeads = useMemo(() => {
    const apiStage = reverseStageMapping[activeStage]

    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStage = lead.current_stages === apiStage

      return matchesSearch && matchesStage
    })
  }, [leads, searchQuery, activeStage, reverseStageMapping])

  const paginatedData = useMemo(() => {
    if (itemsPerPage >= 99999) return filteredLeads
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLeads.slice(startIndex, endIndex)
  }, [filteredLeads, currentPage, itemsPerPage])

  const totalPages = filteredLeads.length === 0
    ? 0
    : Math.max(1, Math.ceil(filteredLeads.length / (itemsPerPage >= 99999 ? filteredLeads.length : itemsPerPage)))

  const renderRightDetail = () => {
    if (!selectedLead) return (
      <div className="text-center text-gray-400 py-8">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="font-medium">Select a lead to view details</p>
      </div>
    )

    switch (activeTab) {
      case 'General Info': return <GeneralInfo lead={selectedLead} />
      case 'Quotation': return <Quotation lead={selectedLead} />
      case 'Purchase Order': return <PurchaseOrder lead={selectedLead} />
      case 'Invoice': return <Invoice lead={selectedLead} />
      default: return null
    }
  }

  const handleStageChange = (newStage: string) => {
    setActiveStage(newStage)
    setCurrentPage(1)
    setSearchQuery('')

    const apiStage = reverseStageMapping[newStage]
    const stageLeads = leads.filter(l => l.current_stages === apiStage)
    setSelectedLead(stageLeads[0] || null)
  }

  const handleLeadStageUpdate = async (newStage: string) => {
    if (!selectedLead) return
    await updateLeadStage(selectedLead.id, newStage)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">Pipelines</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Pipelines</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading pipelines data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Bizdev / <span className="text-slate-600">Pipelines</span>
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Pipelines</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Failed to Load Data</h3>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={fetchLeads}
              className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, leadId: null })}
        onConfirm={confirmDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="reject"
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">Pipelines</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h1 className="text-2xl font-semibold mt-1 text-black">Pipelines</h1>
          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{leads.length}</span> leads
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {stages.map((stage) => {
            const apiStage = reverseStageMapping[stage]
            const count = leads.filter(l => l.current_stages === apiStage).length

            return (
              <button
                key={stage}
                onClick={() => handleStageChange(stage)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-1.5 sm:gap-2 transition ${activeStage === stage ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                style={activeStage === stage ? { backgroundColor: '#00A6FB' } : {}}
              >
                {stage}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeStage === stage ? 'bg-white text-sky-500' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-auto">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name or company..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full sm:w-64 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={fetchLeads}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 flex flex-col h-full">
            <div className="flex-1 space-y-2 mb-3">
              <div className="flex justify-center">
                <button
                  onClick={() => router.push('/bizdev/new-leads/add-leads')}
                  className="px-6 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition shadow-sm"
                  style={{ backgroundColor: '#00A6FB' }}
                >
                  + Add New Lead
                </button>
              </div>

              {paginatedData.length === 0 ? (
                <EmptyState
                  type={searchQuery ? 'search' : 'data'}
                  title={`No leads in "${activeStage}"`}
                  description={searchQuery ? 'Try a different search term' : 'Add a new lead or try a different stage'}
                />
              ) : (
                paginatedData.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-3 rounded-lg cursor-pointer transition ${selectedLead?.id === lead.id ? 'shadow-md' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                      }`}
                    style={selectedLead?.id === lead.id ? { backgroundColor: '#00A6FB', color: 'white' } : {}}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{lead.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${selectedLead?.id === lead.id
                            ? 'bg-white bg-opacity-20 text-gray-600'
                            : 'bg-gray-200 text-gray-600'
                            }`}>
                            #{lead.id}
                          </span>
                        </div>
                        {lead.company && (
                          <p className="text-sm opacity-80 truncate">{lead.company}</p>
                        )}
                        <p className="text-xs mt-2 opacity-70 flex items-center gap-1">
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(lead.period).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteClick(lead.id)
                        }}
                        className={`p-2 rounded-lg transition shrink-0 ml-2 ${selectedLead?.id === lead.id
                          ? 'hover:bg-white hover:bg-opacity-20 text-red-500'
                          : 'hover:bg-red-50 text-red-500'
                          }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>


            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={(newValue) => {
                setItemsPerPage(newValue)
                setCurrentPage(1)
              }}
              isCompact
            />
          </div>

          <div className="lg:col-span-8 space-y-4">
            {selectedLead ? (
              <>
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm text-black block mb-2 font-semibold">STAGE</label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg text-sm text-black focus:outline-none focus:border-sky-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={stageMapping[selectedLead.current_stages] || 'New lead'}
                        onChange={(e) => handleLeadStageUpdate(e.target.value)}
                        disabled={isUpdating}
                      >
                        {stages.map((stage) => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                      {isUpdating && (
                        <p className="text-xs text-sky-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Updating...
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-2 font-semibold">PARTNER</label>
                      <input
                        type="text"
                        value={selectedLead.partner_name}
                        disabled
                        className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2 font-semibold">DESCRIPTION</label>
                    <textarea
                      value={selectedLead.description || 'No description'}
                      disabled
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 resize-none"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-6 bg-white shadow-sm">
                  <div className="flex gap-4 sm:gap-6 border-b mb-6 overflow-x-auto">
                    {['General Info', 'Quotation', 'Purchase Order', 'Invoice'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium transition whitespace-nowrap ${activeTab === tab ? 'border-b-2' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        style={activeTab === tab ? { color: '#00A6FB', borderColor: '#00A6FB' } : {}}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-75">{renderRightDetail()}</div>

                  <div className="flex justify-center gap-3 pt-6 border-t mt-6">
                    <button
                      className="text-white px-6 py-2 rounded-lg hover:opacity-90 transition shadow-sm"
                      style={{ backgroundColor: '#00A6FB' }}
                    >
                      Submit
                    </button>
                    <button className="text-gray-700 px-6 py-2 border rounded-lg hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="border rounded-lg p-12 bg-white text-center shadow-sm">
                <div className="text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-gray-600">No Lead Selected</p>
                  <p className="text-sm mt-1">Select a lead from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}