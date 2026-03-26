export default function ScholarshipsTypePage() {
  const scholarshipTypes = [
    {
      id: "TYPE-001",
      name: "Government",
      description:
        "Scholarship funded by government institutions for eligible participants based on academic achievement and financial need.",
      category: "Public",
      status: "Active",
      totalRecipients: 100,
      coverageAmount: "Rp 50.000.000",
    },
    {
      id: "TYPE-002",
      name: "Private",
      description:
        "Scholarship provided by private companies or corporations to support talented individuals in their field.",
      category: "Corporate",
      status: "Active",
      totalRecipients: 50,
      coverageAmount: "Rp 30.000.000",
    },
    {
      id: "TYPE-003",
      name: "Internal",
      description:
        "Scholarship offered by the institution itself to support students or employees within the organization.",
      category: "Internal",
      status: "Active",
      totalRecipients: 30,
      coverageAmount: "Rp 20.000.000",
    },
    {
      id: "TYPE-004",
      name: "Partnership",
      description:
        "Scholarship resulting from collaboration between two or more organizations to support educational programs.",
      category: "Collaboration",
      status: "Active",
      totalRecipients: 40,
      coverageAmount: "Rp 25.000.000",
    },
    {
      id: "TYPE-005",
      name: "Foundation",
      description:
        "Scholarship granted by non-profit foundations dedicated to advancing education and skills development.",
      category: "Non-Profit",
      status: "Inactive",
      totalRecipients: 25,
      coverageAmount: "Rp 15.000.000",
    },
  ];

  const statusColor: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Inactive: "bg-gray-100 text-gray-500",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  const categoryColor: Record<string, string> = {
    Public: "bg-blue-100 text-blue-700",
    Corporate: "bg-purple-100 text-purple-700",
    Internal: "bg-teal-100 text-teal-700",
    Collaboration: "bg-orange-100 text-orange-700",
    "Non-Profit": "bg-pink-100 text-pink-700",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Training Course /{" "}
          <span className="text-slate-600">Scholarships Type</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">
          Scholarships Type
        </h1>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scholarshipTypes.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-slate-400 mb-1">{item.id}</p>
                <h2 className="text-sm font-bold text-black leading-tight">
                  {item.name}
                </h2>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${statusColor[item.status]}`}
              >
                {item.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-3">
              {item.description}
            </p>

            {/* Category Badge */}
            <div className="mb-4">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColor[item.category] ?? "bg-gray-100 text-gray-600"
                  }`}
              >
                {item.category}
              </span>
            </div>

            {/* Info Row */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div>
                <p className="text-xs text-slate-400">Coverage Amount</p>
                <p className="text-sm font-semibold text-black">
                  {item.coverageAmount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Recipients</p>
                <p className="text-sm font-semibold text-black">
                  {item.totalRecipients} people
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}