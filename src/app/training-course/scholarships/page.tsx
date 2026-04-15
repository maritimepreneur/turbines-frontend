"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveTable } from "@/components/table/ResponsiveTable";
import { EmptyState } from "@/components/table/EmptyState";
import { SearchBar } from "@/components/table/SearchBar";
import { Pagination } from "@/components/table/Pagination";
import { NotificationModal } from "@/components/modals/NotificationModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import axiosInstance from "@/lib/axios";

type ScholarshipMeta = {
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
};

type ScholarshipCourse = {
  id: number;
  name: string;
  status: string;
  date: string;
  type: string;
  category: string;
  original_price: number;
  discount: number;
  price: number;
  code: string;
  meta: ScholarshipMeta;
};

export default function ScholarshipsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All"); // status filter
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<ScholarshipCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number; name: string }>({ open: false, id: 0, name: "" });
  const [notifModal, setNotifModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "error" as "success" | "error" | "info",
  });

  const fetchScholarships = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/api/scholarships/");
      const list =
        response.data?.data?.list ||
        response.data?.data ||
        response.data ||
        [];
      setData(Array.isArray(list) ? list : []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Gagal memuat data Scholarships";
      setNotifModal({ open: true, title: "Gagal", message: msg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setIsDeleting(deleteModal.id);
      const res = await axiosInstance.delete(`/api/scholarships/${deleteModal.id}`);
      if (res.data.code === 200) {
        setNotifModal({ open: true, title: "Success", message: "Scholarship deleted successfully", type: "success" });
        await fetchScholarships();
      } else throw new Error(res.data.message);
    } catch (err: any) {
      setNotifModal({ open: true, title: "Error", message: err.response?.data?.message || "Failed to delete", type: "error" });
    } finally { setIsDeleting(null); setDeleteModal({ open: false, id: 0, name: "" }); }
  };

  const [isToggling, setIsToggling] = useState<number | null>(null);

  const handleToggleStatus = async (item: ScholarshipCourse) => {
    const newStatus = item.status?.toLowerCase() === "active" ? "deactive" : "active";
    try {
      setIsToggling(item.id);
      const res = await axiosInstance.post(`/api/scholarships/status/${item.id}`, { status: newStatus });
      if (res.data.code === 200 || res.data.code === 201) {
        setNotifModal({ open: true, title: "Success", message: `Scholarship ${newStatus === "active" ? "activated" : "deactivated"} successfully`, type: "success" });
        await fetchScholarships();
      } else throw new Error(res.data.message);
    } catch (err: any) {
      setNotifModal({ open: true, title: "Error", message: err.response?.data?.message || "Failed to update status", type: "error" });
    } finally { setIsToggling(null); }
  };

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  const STATUS_TABS = ["All", "Active", "Deactive"];
  const CATEGORY_OPTIONS = ["Certification", "Training Course"];

  const filteredData = useMemo(() => {
    let result = [...data];
    if (activeTab !== "All") {
      result = result.filter(
        (item) => item.status?.toLowerCase() === activeTab.toLowerCase()
      );
    }
    if (categoryFilter) {
      result = result.filter(
        (item) => item.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(lowerSearch) ||
          item.category?.toLowerCase().includes(lowerSearch) ||
          item.code?.toLowerCase().includes(lowerSearch)
      );
    }
    return result;
  }, [activeTab, categoryFilter, search, data]);

  const paginatedData = useMemo(() => {
    if (itemsPerPage >= 99999) return filteredData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages =
    filteredData.length === 0
      ? 0
      : Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div>
      <ConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: 0, name: "" })}
        onConfirm={handleDelete}
        title="Delete Scholarship"
        message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="reject"
      />
      <NotificationModal
        isOpen={notifModal.open}
        title={notifModal.title}
        message={notifModal.message}
        type={notifModal.type}
        onClose={() =>
          setNotifModal({ open: false, title: "", message: "", type: "error" })
        }
      />

      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Training Course / <span className="text-slate-600">Scholarships</span>
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
          <h1 className="text-2xl font-semibold text-black">Scholarships</h1>
          <div className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{filteredData.length}</span> courses
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 text-black">
        {/* Status Tabs */}
        <div className="border-b border-slate-200 mb-4">
          <nav className="flex overflow-x-auto no-scrollbar space-x-1 pb-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search by name, code..."
            />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={fetchScholarships}
              disabled={isLoading}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => router.push("/training-course/scholarships/add")}
              className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition flex-1 sm:flex-none"
            >
              + Add
            </button>
          </div>
        </div>

        <div className="mt-4">
          <ResponsiveTable<ScholarshipCourse>
            columns={[
              {
                header: "Course Name",
                accessor: "name",
                isPrimary: true,
                cellClassName: "font-medium text-slate-800",
                render: (item) => (
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800">
                      {item.name || "-"}
                    </span>
                    {item.code && (
                      <span className="text-xs text-slate-500 mt-0.5">
                        {item.code}
                        {item.category ? ` - ${item.category}` : ""}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: "Expired Date",
                accessor: "date",
                render: (item) => (
                  <span className="text-sm text-slate-600">
                    {item.date || "-"}
                  </span>
                ),
              },
              {
                header: "Price",
                accessor: "price",
                render: (item) => (
                  <span className="text-sm font-semibold text-sky-600">
                    {formatCurrency(item.price)}
                  </span>
                ),
              },
              {
                header: "Original Price",
                accessor: "original_price",
                render: (item) => (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(item.original_price)}
                  </span>
                ),
              },
              {
                header: "Discount",
                accessor: "discount",
                render: (item) => (
                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    {item.discount}%
                  </span>
                ),
              },
              {
                header: "Status",
                accessor: "status",
                render: (item) => {
                  if (!item.status)
                    return <span className="text-sm text-slate-400">-</span>;
                  const st = item.status.toLowerCase();
                  let cls = "bg-slate-100 text-slate-700";
                  if (st === "active" || st === "open")
                    cls = "bg-emerald-100 text-emerald-700";
                  else if (st === "deactive")
                    cls = "bg-orange-100 text-orange-700";
                  return (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
                      {item.status}
                    </span>
                  );
                },
              },
              {
                header: "Action",
                render: (item) => (
                  <div className="flex gap-3 items-center">
                    {/* Toggle Active/Deactive */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
                      disabled={isToggling === item.id}
                      className={`transition disabled:opacity-50 ${item.status?.toLowerCase() === "active"
                          ? "text-orange-400 hover:text-orange-600"
                          : "text-emerald-500 hover:text-emerald-700"
                        }`}
                      title={item.status?.toLowerCase() === "active" ? "Deactivate" : "Activate"}
                    >
                      {isToggling === item.id
                        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d={item.status?.toLowerCase() === "active"
                                ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"}
                            />
                          </svg>
                        )
                      }
                    </button>
                    {/* Edit */}
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/training-course/scholarships/edit?id=${item.id}`); }}
                      className="text-sky-500 hover:text-sky-700 transition"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteModal({ open: true, id: item.id, name: item.name }); }}
                      disabled={isDeleting === item.id}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                      title="Delete"
                    >
                      {isDeleting === item.id
                        ? <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      }
                    </button>
                  </div>
                ),
              },
            ]}
            data={paginatedData}
            keyAccessor={(item) => item.id}
            showTopBorder={false}
            emptyState={
              isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-slate-500 text-sm">Loading...</p>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No courses found"
                  description={
                    search || activeTab !== "All" || categoryFilter
                      ? "Try adjusting your search or filters."
                      : "No scholarship data available."
                  }
                />
              )
            }
          />
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onItemsPerPageChange={(v) => {
            setItemsPerPage(v);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
