'use client'

interface Lead {
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

interface InvoiceProps {
  lead?: Lead | null
}

export default function InvoiceForm({ lead }: InvoiceProps) {
  return (
    <div className="space-y-4 text-black">
      {/* Invoice Info */}
      <div>
        <label className="text-sm block mb-2 text-black">Number</label>
        <input
          type="text"
          placeholder="Enter invoice number..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Created</label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Period</label>
        <input
          type="text"
          placeholder="Enter period..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Due Date</label>
        <input
          type="date"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Billed Amount</label>
        <input
          type="number"
          placeholder="Enter billed amount..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Total Amount</label>
        <input
          type="number"
          placeholder="Enter total amount..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Contact ID</label>
        <input
          type="text"
          placeholder="Enter contact ID..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Partner ID</label>
        <input
          type="text"
          placeholder="Enter partner ID..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Notes</label>
        <textarea
          placeholder="Enter notes..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">PO ID</label>
        <input
          type="text"
          placeholder="Enter PO ID..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm block mb-2 text-black">VAT</label>
          <input
            type="number"
            placeholder="Enter VAT..."
            className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
          />
        </div>
        <div>
          <label className="text-sm block mb-2 text-black">PPH</label>
          <input
            type="number"
            placeholder="Enter PPH..."
            className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Grand Total</label>
        <input
          type="number"
          placeholder="Enter grand total..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Others</label>
        <input
          type="text"
          placeholder="Enter other charges..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Discount</label>
        <input
          type="number"
          placeholder="Enter discount..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      {/* Payment Details */}
      <div>
        <label className="text-sm block mb-2 text-black">Payment Details (JSON)</label>
        <textarea
          placeholder='e.g. {"method":"transfer","account":"123-456"}'
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 resize-none"
          rows={3}
        />
      </div>

      {/* Payments Array */}
      <div>
        <label className="text-sm block mb-2 text-black">Payments (Array)</label>
        <textarea
          placeholder='e.g. [{"date":"2025-10-12","amount":1000}]'
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 resize-none"
          rows={3}
        />
      </div>

      {/* Agreement Letter */}
      <div>
        <label className="text-sm block mb-2 text-black">Agreement Letter</label>
        <input
          type="file"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black"
        />
      </div>
    </div>
  )
}
