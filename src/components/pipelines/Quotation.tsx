'use client'

import { useState, useEffect } from 'react'
import axiosInstance from '@/lib/axios'

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

interface QuotationProps {
  lead?: Lead | null
}

export default function QuotationForm({ lead }: QuotationProps) {
  const [quotation, setQuotation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!lead?.id) return
      setLoading(true)
      try {
        const response = await axiosInstance.get('/api/quotations/')
        if (response.data && Array.isArray(response.data.data)) {
          const match = response.data.data.find(
            (q: any) => q.lead_id === lead.id || q.lead?.id === lead.id
          )
          setQuotation(match || null)
        }
      } catch (error) {
        console.error("Error fetching quotation:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuotation()
  }, [lead?.id])

  if (loading) {
    return <div className="text-black p-4 text-center">Loading quotation data...</div>
  }

  if (!quotation && lead?.id) {
    return <div className="text-gray-500 p-4 text-center">No quotation data found for this lead.</div>
  }

  return (
    <div className="space-y-4 text-black">
      {/* Quotation Info */}
      <div>
        <label className="text-sm block mb-2 text-black">ID</label>
        <input
          type="text"
          readOnly
          value={quotation?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Name</label>
        <input
          type="text"
          readOnly
          value={quotation?.name || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Number</label>
        <input
          type="text"
          readOnly
          value={quotation?.number || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Total Amount</label>
        <input
          type="text"
          readOnly
          value={quotation?.total_amount ? `Rp ${Number(quotation.total_amount).toLocaleString('id-ID')}` : ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">
          Document Content (Drive Link)
        </label>
        <input
          type="url"
          readOnly
          value={quotation?.document_content || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Contact ID</label>
        <input
          type="text"
          readOnly
          value={quotation?.contact_id || quotation?.contact?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Partner ID</label>
        <input
          type="text"
          readOnly
          value={quotation?.partner_id || quotation?.partner?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      {/* Summary */}
      <div>
        <label className="text-sm block mb-2 text-black">Summary</label>
        <textarea
          readOnly
          value={quotation?.summary || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200 resize-none"
          rows={4}
        />
      </div>

      {/* Offering Letter / MoU */}
      <div>
        <label className="text-sm block mb-2 text-black">Offering Letter (MoU)</label>
        {quotation?.offering_letter ? (
          <div className="mt-1">
            <a href={quotation.offering_letter} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-sm truncate block">
              View / Download Offering Letter
            </a>
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-2">No offering letter attached</div>
        )}
      </div>

    </div>
  )
}
