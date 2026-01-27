import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faCheck,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/dist/client/link";

export default function AddLeadsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mt-1 text-black">
          Quotation Form
        </h1>
        <p className="text-sm text-slate-400">
          <span className="text-blue-600">Quotation/New</span>/QTXXX
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg text-black">
        {/* Form Content */}
        <div className="">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Quotation Number
                </label>
                <input
                  type="text"
                  className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Client Name
                </label>
                <select className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200">
                  <option value="">Select Client</option>
                  <option value="phone">Client A</option>
                  <option value="whatsapp">Client B</option>
                </select>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Project Name
                </label>
                <input
                  type="text"
                  className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Total Amount
                </label>
                <input
                  type="text"
                  className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>
            </div>

            <h2 className="text-lg font-bold mb-4">Document/Attachments</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-12 mb-4">
                  <label className="text-xs font-semibold text-black w-24 flex-shrink-0">
                    Project ID
                  </label>
                  <input
                    type="text"
                    className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>

                <div className="flex items-center gap-12 mb-4">
                  <label className="text-xs font-semibold text-black w-24 flex-shrink-0">
                    Quantity
                  </label>
                  <input
                    type="text"
                    className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>

                <div className="flex items-center gap-12 mb-4">
                  <label className="text-xs font-semibold text-black w-24 flex-shrink-0">
                    Price
                  </label>
                  <input
                    type="email"
                    className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                    Project Name
                  </label>
                  <input
                    type="text"
                    className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                    Project Duration
                  </label>
                  <input
                    type="text"
                    className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                    Price
                  </label>
                  <input
                    type="text"
                    className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Link href="/finance/quotation">
                <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                  Cancel
                </button>
              </Link>
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
