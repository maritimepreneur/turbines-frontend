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

interface PurchaseOrderProps {
  lead?: Lead | null
}

export default function PurchaseOrderForm({ lead }: PurchaseOrderProps) {
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPurchaseOrder = async () => {
      if (!lead?.id) return
      setLoading(true)
      try {
        // Assume API endpoint is /api/purchase-orders/ or /api/purchases/
        // Attempting to fetch all and filter by lead.id
        const response = await axiosInstance.get('/api/purchases/').catch(() => axiosInstance.get('/api/purchase-orders/'))
        if (response.data && Array.isArray(response.data.data)) {
          const match = response.data.data.find(
            (po: any) => po.lead_id === lead.id || po.lead?.id === lead.id
          )
          setPurchaseOrder(match || null)
        }
      } catch (error) {
        console.error("Error fetching purchase order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPurchaseOrder()
  }, [lead?.id])

  if (loading) {
    return <div className="text-black p-4 text-center">Loading purchase order data...</div>
  }

  if (!purchaseOrder && lead?.id) {
    return <div className="text-gray-500 p-4 text-center">No purchase order data found for this lead.</div>
  }

  return (
    <div className="space-y-4 text-black">
      {/* PO Info */}
      <div>
        <label className="text-sm block mb-2 text-black">ID</label>
        <input
          type="text"
          readOnly
          value={purchaseOrder?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Number</label>
        <input
          type="text"
          readOnly
          value={purchaseOrder?.number || purchaseOrder?.po_number || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Attachment</label>
        {purchaseOrder?.attachment ? (
          <div className="mt-1">
            <a href={purchaseOrder.attachment} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-sm truncate block">
              View / Download Attachment
            </a>
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-2">No attachment</div>
        )}
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Partner ID</label>
        <input
          type="text"
          readOnly
          value={purchaseOrder?.partner_id || purchaseOrder?.partner?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Contact ID</label>
        <input
          type="text"
          readOnly
          value={purchaseOrder?.contact_id || purchaseOrder?.contact?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Quotation ID</label>
        <input
          type="text"
          readOnly
          value={purchaseOrder?.quotation_id || purchaseOrder?.quotation?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>


    </div>
  )
}
