'use client'

export default function GeneralInfo() {
  return (
    <div className="space-y-4 text-black">
      {/* Company Info */}
      <div>
        <label className="text-sm block mb-2 text-black">
          Company Name
        </label>
        <input
          type="text"
          placeholder="Enter company name..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">
          Company Initial
        </label>
        <input
          type="text"
          placeholder="Enter initial..."
          className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">
          Company Type
        </label>
        <select className="w-full px-3 py-2 border rounded-lg text-sm text-black">
          <option value="">Select type...</option>
          <option>Client</option>
          <option>Partner</option>
        </select>
      </div>

      <div>
        <label className="text-sm block mb-2 text-black">
          Company Industry
        </label>
        <select className="w-full px-3 py-2 border rounded-lg text-sm text-black">
          <option value="">Select industry...</option>
          <option>Manufacturing</option>
          <option>Logistics</option>
          <option>Technology</option>
        </select>
      </div>

      {/* Contact Details */}
      <div className="pt-4">
        <h3 className="text-sm font-semibold mb-4 text-black">
          👤 CONTACT DETAILS
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm block mb-2 text-black">
              Role
            </label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm text-black">
              <option value="">Select role...</option>
              <option>Director</option>
              <option>Manager</option>
              <option>Staff</option>
            </select>
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Name
            </label>
            <input
              type="text"
              placeholder="Full name"
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Email
            </label>
            <input
              type="email"
              placeholder="email@company.com"
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm block mb-2 text-black">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+62..."
              className="w-full px-3 py-2 border rounded-lg text-sm text-black placeholder:text-gray-400"
            />
          </div>

          {/* Attachment & Log */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-black"
            >
              Attachment +
            </button>

            <button
              type="button"
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-black"
            >
              Log History & Comments
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
