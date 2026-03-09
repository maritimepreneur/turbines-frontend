"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import axiosInstance from "@/lib/axios"
import GeneralInfo from "@/components/pipelines/GeneralInfo"
import Quotation from "@/components/pipelines/Quotation"
import PurchaseOrder from "@/components/pipelines/PurchaseOrder"
import Invoice from "@/components/pipelines/Invoice"

interface Lead {
  id: number
  name: string
  period: string
  description: string
  contact_id: number | null
  partner_id: number | null
  current_stages: string
  contact_name: string | null
  company: string | null
  partner_name: string
}

function GeneralInfoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const leadIdStr = searchParams.get('id')
  const leadId = leadIdStr ? parseInt(leadIdStr, 10) : null

  const [lead, setLead] = useState<Lead | null>(null)
  const [activeTab, setActiveTab] = useState('General Info')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!leadId) {
      router.push('/bizdev/new-leads')
      return
    }

    const fetchLead = async () => {
      try {
        setIsLoading(true)
        const res = await axiosInstance.get(`/api/leads/${leadId}`)
        setLead(res.data.data)
      } catch (err: any) {
        console.error("Failed to fetch lead", err)
        setError(err.response?.data?.message || "Failed to load lead details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLead()
  }, [leadId, router])

  const renderContent = () => {
    switch (activeTab) {
      case 'General Info': return <GeneralInfo lead={lead} />
      case 'Quotation': return <Quotation lead={lead} />
      case 'Purchase Order': return <PurchaseOrder lead={lead} />
      case 'Invoice': return <Invoice lead={lead} />
      default: return null
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">Bizdev / New Leads / <span className="text-slate-600">Loading...</span></p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Detail</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4">Loading detail...</p>
        </div>
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div>
        <div className="mb-6">
          <p className="text-sm text-slate-400">Bizdev / New Leads</p>
          <h1 className="text-2xl font-semibold mt-1 text-black">Detail Error</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center py-12">
          <div className="text-red-500 font-medium mb-4">{error || "Lead not found"}</div>
          <button onClick={() => router.push('/bizdev/new-leads')} className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">
            Back to New Leads
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / New Leads / <span className="text-slate-600">#{lead.id} {lead.name}</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Detail</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black p-6">
        <div className="flex gap-4 sm:gap-6 border-b mb-6 overflow-x-auto">
          {['General Info', 'Quotation', 'Purchase Order', 'Invoice'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium transition whitespace-nowrap ${activeTab === tab ? 'border-b-2 text-sky-500 border-sky-500' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="min-h-[75vh]">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default function GeneralInfoPage() {
  return (
    <Suspense fallback={
      <div className="p-6 text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4">Loading application...</p>
      </div>
    }>
      <GeneralInfoContent />
    </Suspense>
  )
}
