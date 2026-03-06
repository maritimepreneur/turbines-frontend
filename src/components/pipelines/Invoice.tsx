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

interface InvoiceProps {
  lead?: Lead | null
}

export default function InvoiceForm({ lead }: InvoiceProps) {
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!lead?.id) return
      setLoading(true)
      try {
        const response = await axiosInstance.get('/api/invoices/')
        if (response.data && Array.isArray(response.data.data)) {
          const match = response.data.data.find(
            (inv: any) => inv.lead_id === lead.id || inv.lead?.id === lead.id
          )
          setInvoice(match || null)
        }
      } catch (error) {
        console.error("Error fetching invoice:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [lead?.id])

  if (loading) {
    return <div className="text-black p-4 text-center">Loading invoice data...</div>
  }

  if (!invoice && lead?.id) {
    return <div className="text-gray-500 p-4 text-center">No invoice data found for this lead.</div>
  }

  return (
    <div className="space-y-4 text-black">
      {/* Invoice Info */}
      <div>
        <label className="text-sm block mb-2 text-black">Number</label>
        <input
          type="text"
          readOnly
          value={invoice?.number || invoice?.invoice_number || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Created</label>
        <input
          type="date"
          readOnly
          value={invoice?.created_at ? new Date(invoice.created_at).toISOString().split('T')[0] : ''}
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Period</label>
        <input
          type="text"
          readOnly
          value={invoice?.period || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Due Date</label>
        <input
          type="date"
          readOnly
          value={invoice?.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : ''}
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Billed Amount</label>
        <input
          type="text"
          readOnly
          value={invoice?.billed_amount ? `Rp ${Number(invoice.billed_amount).toLocaleString('id-ID')}` : ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Total Amount</label>
        <input
          type="text"
          readOnly
          value={invoice?.total_amount ? `Rp ${Number(invoice.total_amount).toLocaleString('id-ID')}` : ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Contact ID</label>
        <input
          type="text"
          readOnly
          value={invoice?.contact_id || invoice?.contact?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Partner ID</label>
        <input
          type="text"
          readOnly
          value={invoice?.partner_id || invoice?.partner?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Notes</label>
        <textarea
          readOnly
          value={invoice?.notes || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200 resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">PO ID</label>
        <input
          type="text"
          readOnly
          value={invoice?.po_id || invoice?.purchase_order?.id || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm block mb-2 text-black">VAT</label>
          <input
            type="text"
            readOnly
            value={invoice?.vat || ''}
            placeholder="-"
            className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
          />
        </div>
        <div>
          <label className="text-sm block mb-2 text-black">PPH</label>
          <input
            type="text"
            readOnly
            value={invoice?.pph || ''}
            placeholder="-"
            className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Grand Total</label>
        <input
          type="text"
          readOnly
          value={invoice?.grand_total ? `Rp ${Number(invoice.grand_total).toLocaleString('id-ID')}` : ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Others</label>
        <input
          type="text"
          readOnly
          value={invoice?.others || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Discount</label>
        <input
          type="text"
          readOnly
          value={invoice?.discount || ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200"
        />
      </div>

      {/* Payment Details */}
      <div>
        <label className="text-sm block mb-2 text-black">Payment Details (JSON)</label>
        <textarea
          readOnly
          value={invoice?.payment_details ? JSON.stringify(invoice.payment_details, null, 2) : ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200 resize-none font-mono text-xs"
          rows={3}
        />
      </div>

      {/* Payments Array */}
      <div>
        <label className="text-sm block mb-2 text-black">Payments</label>
        <textarea
          readOnly
          value={invoice?.payments ? JSON.stringify(invoice.payments, null, 2) : ''}
          placeholder="-"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black bg-gray-50 border-gray-200 resize-none font-mono text-xs"
          rows={3}
        />
      </div>

      {/* Agreement Letter */}
      <div>
        <label className="text-sm block mb-2 text-black">Agreement Letter</label>
        {invoice?.agreement_letter ? (
          <div className="mt-1">
            <a href={invoice.agreement_letter} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 underline text-sm truncate block">
              View / Download Agreement Letter
            </a>
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-2">No agreement letter</div>
        )}
      </div>
    </div>
  )
}
