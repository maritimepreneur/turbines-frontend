import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faCheck,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

export default function AddLeadsPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Form</h1>
      </div>


      <div className="bg-white rounded-xl shadow-sm text-black">
        {/* Form Content */}
        <div className="h-[calc(100vh-240px)] overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-black block mb-1">
                  ID
                </label>
                <input
                  type="text"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
                <label className="text-xs font-semibold text-black block mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
                <label className="text-xs font-semibold text-black block mb-1">
                  PIC
                </label>
                <input
                  type="text"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
                <label className="text-xs font-semibold text-black block mb-1">
                  Contact Type
                </label>
                <select className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200">
                  <option value="">Select Contact Type</option>
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-black block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
                <label className="text-xs font-semibold text-black block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>
            </div>

            <h2 className="text-lg font-bold mb-4">Detail Company</h2>

            <div>
              <label className="text-xs font-semibold text-black block mb-1">
                  Company ID
                </label>
                <input
                  type="text"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />

              <label className="text-xs font-semibold text-black block mb-1">
                Company Name
              </label>
              <input
                type="text"
                className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
              />

              <label className="text-xs font-semibold text-black block mb-1">
                Company Industrial
              </label>
              <input
                type="text"
                className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
              />
              <label className="text-xs font-semibold text-black block mb-1">
                  Company Type
                </label>
                <select className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200">
                  <option value="">Select Company Type</option>
                  <option value="nonprofit">Non-Profit</option>
                  <option value="public">public</option>
                  <option value="stateowned">State Owned</option>
                  <option value="private">Private</option>
                  <option value="government">Government</option>
                  <option value="other">Other</option>
                </select>

              <label className="text-xs font-semibold text-black block mb-1">
                Notes
              </label>
              <textarea
                rows={4}
                placeholder="Enter your notes here..."
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-vertical"
              />
            </div>

            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                Cancel
              </button>
              <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
