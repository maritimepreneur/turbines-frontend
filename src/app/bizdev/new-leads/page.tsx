import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong, faCheck, faFilter } from "@fortawesome/free-solid-svg-icons";

export default function NewLeadsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">New Leads</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">New Leads</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 text-black">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="gap-3 flex ">
            <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="w-3 h-3 text-white" />
              <span className="text-center">Filter</span>
            </button>
            <input
              placeholder="Search..."
              className="px-4 py-2 border rounded-lg text-sm w-64 text-black"
            />
          </div>

          <Link href="/bizdev/add-leads">
            <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition">
              + Add
            </button>
          </Link>
        </div>

        {/* Table */}
        <table className="w-full text-sm border-t border-slate-200">
        {/* TABLE HEADER */}
        <thead className="bg-slate-50 text-slate-900">
        <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-3 font-semibold">ID</th>
            <th className="text-left py-3 px-3 font-semibold">Name</th>
            <th className="text-left py-3 px-3 font-semibold">PIC</th>
            <th className="text-left py-3 px-3 font-semibold">Company Name</th>
            <th className="text-left py-3 px-3 font-semibold">Period</th>
            <th className="text-left py-3 px-3 font-semibold">Industry</th>
            <th className="text-left py-3 px-3 font-semibold">Last Update</th>
            <th className="text-left py-3 px-3 font-semibold">Action</th>
        </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody className="text-slate-900">
            <tr className="border-b hover:bg-slate-50 transition">
            <td className="py-3 px-3">ID/001/LD/2024</td>
            <td className="py-3 px-3 font-medium">John Doe</td>
            <td className="py-3 px-3">xxxxx</td>
            <td className="py-3 px-3">Lorem Corp</td>
            <td className="py-3 px-3">Aug 2025</td>
            <td className="py-3 px-3">Tech Services</td>
            <td className="py-3 px-3">24-05-2024</td>
            <td className="py-3 px-3 text-center">✏️ 🗑️</td>
            </tr>

            <tr className="border-b hover:bg-slate-50 transition">
            <td className="py-3 px-3">ID/002/LD/2024</td>
            <td className="py-3 px-3 font-medium">Jane Smith</td>
            <td className="py-3 px-3">xxxxx</td>
            <td className="py-3 px-3">Ipsum Solutions</td>
            <td className="py-3 px-3">Sep 2025</td>
            <td className="py-3 px-3">Logistics</td>
            <td className="py-3 px-3">23-05-2024</td>
            <td className="py-3 px-3 text-center">✏️ 🗑️</td>
            </tr>

            <tr className="hover:bg-slate-50 transition">
            <td className="py-3 px-3">ID/003/LD/2024</td>
            <td className="py-3 px-3 font-medium">Michael Brown</td>
            <td className="py-3 px-3">xxxxx</td>
            <td className="py-3 px-3">Global Trade Inc</td>
            <td className="py-3 px-3">Oct 2025</td>
            <td className="py-3 px-3">Finance</td>
            <td className="py-3 px-3">22-05-2024</td>
            <td className="py-3 px-3 text-center">✏️ 🗑️</td>
            </tr>
        </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between mt-4 text-sm text-slate-400">
          <p>Showing 1 to 3 of 50 entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded">1</button>
            <button className="px-3 py-1 border rounded">2</button>
            <button className="px-3 py-1 border rounded">3</button>
          </div>
        </div>
      </div>
    </div>
  );
}
