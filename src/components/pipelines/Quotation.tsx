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

interface QuotationProps {
  lead?: Lead | null
}

export default function QuotationForm({ lead }: QuotationProps) {
  return (
    <div className="space-y-4 text-black">
      {/* Quotation Info */}
      <div>
        <label className="text-sm block mb-2 text-black">ID</label>
        <input
          type="text"
          placeholder="Enter ID..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Name</label>
        <input
          type="text"
          placeholder="Enter quotation name..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Number</label>
        <input
          type="text"
          placeholder="Enter number..."
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
        <label className="text-sm block mb-2 text-black">
          Document Content (Drive Link)
        </label>
        <input
          type="url"
          placeholder="https://drive.google.com/..."
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

      {/* Summary */}
      <div>
        <label className="text-sm block mb-2 text-black">Summary</label>
        <textarea
          placeholder="Enter summary..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400 resize-none"
          rows={4}
        />
      </div>

      {/* Offering Letter / MoU */}
      <div>
        <label className="text-sm block mb-2 text-black">Offering Letter (MoU)</label>
        <input
          type="file"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black"
        />
      </div>


    </div>
  )
}
