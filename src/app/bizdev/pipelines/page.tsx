export default function NewLeadsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Bizdev / <span className="text-slate-600">New Leads</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1">New Leads</h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-lg text-sm">
              Filter
            </button>
            <input
              placeholder="Search..."
              className="px-4 py-2 border rounded-lg text-sm w-64"
            />
          </div>

          <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm">
            + Add
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-sm border-t">
          <thead className="text-slate-400">
            <tr className="border-b">
              <th className="text-left py-3">ID</th>
              <th>Name</th>
              <th>PIC</th>
              <th>Company Name</th>
              <th>Period</th>
              <th>Industry</th>
              <th>Last Update</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td>ID/001/LD/2024</td>
              <td className="font-medium">John Doe</td>
              <td>xxxxx</td>
              <td>Lorem Corp</td>
              <td>Aug 2025</td>
              <td>Tech Services</td>
              <td>24-05-2024</td>
              <td>✏️ 🗑️</td>
            </tr>

            <tr className="border-b">
              <td>ID/002/LD/2024</td>
              <td className="font-medium">Jane Smith</td>
              <td>xxxxx</td>
              <td>Ipsum Solutions</td>
              <td>Sep 2025</td>
              <td>Logistics</td>
              <td>23-05-2024</td>
              <td>✏️ 🗑️</td>
            </tr>

            <tr>
              <td>ID/003/LD/2024</td>
              <td className="font-medium">Michael Brown</td>
              <td>xxxxx</td>
              <td>Global Trade Inc</td>
              <td>Oct 2025</td>
              <td>Finance</td>
              <td>22-05-2024</td>
              <td>✏️ 🗑️</td>
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
