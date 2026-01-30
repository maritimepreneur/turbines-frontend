import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faCheck,
  faFilter,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

import Link from "next/dist/client/link";

export default function AddLeadsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mt-1 text-black">
          Purchase Order
        </h1>
        <p className="text-sm text-slate-400">
          <span className="text-blue-600">Purchase Order/New</span>/POXXX
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg text-black">
        {/* Form Content */}
        <div className="">
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  PO Number
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
              <label className="text-xs font-semibold text-black block mb-1">
                Summary of Requrement
              </label>
              <textarea
                rows={4}
                placeholder="Enter here..."
                className="w-full mb-4 px-4 py-2 border bg-gray-200 border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-vertical"
              />
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="text-lg font-bold">Attachments</h2>
              <button className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-blue-600 transition">
                <FontAwesomeIcon icon={faUpload} size="xs" />
                Upload File
              </button>
            </div>
      
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="attachmentMode"
                  value="option1"
                  className="text-blue-500"
                />
                Approve
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="attachmentMode"
                  value="option2"
                  className="text-blue-500"
                />
                Reject
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Link href="/finance/purchase">
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
