'use client'

export default function PurchaseOrderForm() {
  return (
    <div className="space-y-4 text-black">
      {/* PO Info */}
      <div>
        <label className="text-sm block mb-2 text-black">ID</label>
        <input
          type="text"
          placeholder="Enter PO ID..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Number</label>
        <input
          type="text"
          placeholder="Enter PO number..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Attachment</label>
        <input
          type="file"
          className="w-full px-3 py-2 border rounded-lg text-sm text-black"
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
        <label className="text-sm block mb-2 text-black">Contact ID</label>
        <input
          type="text"
          placeholder="Enter contact ID..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">Quotation ID</label>
        <input
          type="text"
          placeholder="Enter quotation ID..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

   
    </div>
  )
}
