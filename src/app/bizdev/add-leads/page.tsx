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
          Bizdev / <span className="text-slate-600">ID/XX/XX/XX</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">Form</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8 px-6 pt-4">
          <button className="pb-2 px-1 border-b-2 border-blue-500 text-black font-medium text-sm">
            General Info
          </button>
          <button className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
            Quotation
          </button>
          <button className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
            Purchase Order
          </button>
          <button className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
            Invoice
          </button>
          <button className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
            Support Documents
          </button>
          <button className="pb-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
            Execution
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        {/* Form Content */}
        <div className="h-[calc(100vh-240px)] overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-black block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  Company ID
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
              </div>

              <div>
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

                <label className="text-xs font-semibold text-black block mb-1">
                  Payment Type
                </label>
                <input
                  type="text"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  Billed Amount
                </label>
                <input
                  type="number"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />

                <label className="text-xs font-semibold text-black block mb-1">
                  Additional Info
                </label>
                <input
                  type="text"
                  className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>
            </div>

            <h2 className="text-lg font-bold mb-4">Detail Project</h2>

            <div>
              <label className="text-xs font-semibold text-black block mb-1">
                Project ID
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
                Project Type
              </label>
              <select className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200">
                <option value="">Select Project Type</option>
                <option value="phone">Tipe 1</option>
                <option value="whatsapp">Tipe 2</option>
              </select>

              <label className="text-xs font-semibold text-black block mb-1">
                Billed Amount
              </label>
              <input
                type="text"
                className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
              />

              <label className="text-xs font-semibold text-black block mb-1">
                Notes
              </label>
              <textarea
                rows={4}
                placeholder="Enter your notes here..."
                className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-vertical"
              />
            </div>

            <h2 className="text-lg font-bold mb-4">Attachments</h2>

            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                Cancel
              </button>
              <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                Edit
              </button>
              <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
