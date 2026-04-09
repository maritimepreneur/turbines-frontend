"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { NotificationModal } from "@/components/modals/NotificationModal";
import axiosInstance from "@/lib/axios";
import { Contact } from "@/types/contact";
import { PurchaseOrder, Quotation } from "@/types/purchaseOrder";

type Partner = {
  id: number;
  name: string;
  initials?: string;
};

export default function PurchaseOrderFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get("id");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [partnerId, setPartnerId] = useState<number | "">("");
  const [contactId, setContactId] = useState<number | "">("");
  const [quotationId, setQuotationId] = useState<number | "">("");
  const [attachment, setAttachment] = useState<File | string | null>(null);
  const [type, setType] = useState<"service" | "goods" | "">("");

  // Data state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  // Loading state
  const [pageLoading, setPageLoading] = useState(false);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);

  // Notification modal state
  const [notifModal, setNotifModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Fetch partners
  useEffect(() => {
    const fetchPartners = async () => {
      setPartnersLoading(true);
      try {
        const response = await axiosInstance.get("/api/partners/");
        const data =
          response.data?.data?.list ||
          response.data?.data ||
          response.data ||
          [];
        setPartners(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching partners:", err);
      } finally {
        setPartnersLoading(false);
      }
    };
    fetchPartners();
  }, []);

  // Fetch quotations
  useEffect(() => {
    const fetchQuotations = async () => {
      setQuotationsLoading(true);
      try {
        const response = await axiosInstance.get("/api/quotations/");
        const data =
          response.data?.data?.list ||
          response.data?.data ||
          response.data ||
          [];
        setQuotations(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error fetching quotations:", err);
      } finally {
        setQuotationsLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  // Fetch PO detail for edit mode
  useEffect(() => {
    if (!poId) return;
    const fetchPO = async () => {
      setPageLoading(true);
      try {
        const response = await axiosInstance.get(`/api/purchase-orders/${poId}`);
        const poData: PurchaseOrder = response.data?.data || response.data;

        setIsHydrating(true);
        setPartnerId(Number(poData.partner_id));
        setContactId(Number(poData.contact_id));
        setQuotationId(Number(poData.quotation_id));

        const raw = poData.attachments;
        if (Array.isArray(raw)) {
          setAttachment(raw[0] ?? null);
        } else if (typeof raw === "string" && raw.trim() !== "") {
          setAttachment(raw);
        } else {
          setAttachment(null);
        }

        const rawType = poData.type;
        if (rawType === "service" || rawType === "goods") {
          setType(rawType);
        } else {
          setType("");
        }

        setTimeout(() => setIsHydrating(false), 500);
      } catch (err: any) {
        setNotifModal({ open: true, title: "Gagal", message: "Gagal memuat data Purchase Order", type: "error" });
      } finally {
        setPageLoading(false);
      }
    };
    fetchPO();
  }, [poId]);

  // Fetch contacts when partnerId changes
  useEffect(() => {
    const fetchContacts = async () => {
      if (!partnerId) {
        setContacts([]);
        return;
      }
      setContactsLoading(true);
      try {
        const response = await axiosInstance.get("/api/contacts/");
        const allContacts: Contact[] = Array.isArray(response.data)
          ? response.data
          : response.data?.data?.list ||
          response.data?.data ||
          [];
        const filtered = allContacts.filter(
          (c: any) =>
            Number(c.partner_id) === Number(partnerId) ||
            Number(c.partnerId) === Number(partnerId) ||
            Number(c.partner?.id) === Number(partnerId)
        );
        setContacts(allContacts);
      } catch (err: any) {
        console.error("Error fetching contacts:", err);
        setContacts([]);
      } finally {
        setContactsLoading(false);
      }
    };
    fetchContacts();
  }, [partnerId]);

  // Reset contactId saat user ganti partner (bukan saat hydrate)
  useEffect(() => {
    if (!isHydrating && partnerId) {
      setContactId("");
    }
  }, [partnerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!partnerId || !contactId || !quotationId || !type) {
      setNotifModal({ open: true, title: "Peringatan", message: "Mohon lengkapi semua field, termasuk Type", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const hasFile = attachment instanceof File;

      if (hasFile) {
        const formData = new FormData();
        formData.append("partner_id", String(partnerId));
        formData.append("contact_id", String(contactId));
        formData.append("quotation_id", String(quotationId));
        formData.append("attachments", attachment as File);
        formData.append("type", type);

        if (poId) {
          await axiosInstance.put(`/api/purchase-orders/update/${poId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await axiosInstance.post("/api/purchase-orders/create", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const jsonPayload = {
          partner_id: Number(partnerId),
          contact_id: Number(contactId),
          quotation_id: Number(quotationId),
          attachments: typeof attachment === "string" ? attachment : "",
          type,
        };

        if (poId) {
          await axiosInstance.put(`/api/purchase-orders/update/${poId}`, jsonPayload);
        } else {
          await axiosInstance.post("/api/purchase-orders/create", jsonPayload);
        }
      }

      setNotifModal({
        open: true,
        title: "Berhasil",
        message: poId ? "Purchase Order berhasil diperbarui" : "Purchase Order berhasil dibuat",
        type: "success",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        (poId ? "Gagal update Purchase Order" : "Gagal membuat Purchase Order");
      setNotifModal({ open: true, title: "Gagal", message: msg, type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotifClose = () => {
    const wasSuccess = notifModal.type === "success";
    setNotifModal({ open: false, title: "", message: "", type: "success" });
    if (wasSuccess) {
      router.push("/finance/purchase");
    }
  };

  const isPageLoading = pageLoading || partnersLoading || quotationsLoading;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mt-1 text-slate-900">Purchase Order</h1>
        <p className="text-sm text-slate-400">
          <Link href="/finance/purchase" className="text-blue-600 hover:underline">
            Purchase Order
          </Link>
          {" / "}
          <span className="text-slate-600">{poId ? "Edit" : "New"}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg text-black">
        <div className="p-6">
          {isPageLoading ? (
            <p className="text-slate-400 text-sm">Loading...</p>
          ) : (
            <>
              {/* PO Number */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">PO Number</label>
                <input
                  type="text"
                  value="(Auto-generated)"
                  disabled
                  className="flex-1 h-10 px-4 border bg-gray-100 border-gray-300 rounded-lg text-gray-400 italic cursor-not-allowed"
                />
              </div>

              {/* Client / Partner */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-slate-900 w-32 flex-shrink-0">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={partnerId}
                  onChange={(e) => setPartnerId(Number(e.target.value))}
                  className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Client</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} ({partner.initials})
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-slate-900 w-32 flex-shrink-0">
                  Contact <span className="text-red-500">*</span>
                </label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(Number(e.target.value))}
                  className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                  disabled={!partnerId}
                >
                  <option value="">
                    {contactsLoading
                      ? "Loading..."
                      : !partnerId
                        ? "Select Client first"
                        : "Select Contact"}
                  </option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name || (contact.emails && contact.emails[0]) || "Unnamed Contact"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quotation */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-slate-900 w-32 flex-shrink-0">
                  Quotation <span className="text-red-500">*</span>
                </label>
                <select
                  value={quotationId}
                  onChange={(e) => setQuotationId(Number(e.target.value))}
                  className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Quotation</option>
                  {quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name || q.number || `Quotation #${q.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-slate-900 w-32 flex-shrink-0">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "service" | "goods")}
                  className="flex-1 h-10 px-4 border bg-gray-200 border-gray-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="service">Service</option>
                  <option value="goods">Goods</option>
                </select>
              </div>

              {/* Attachment */}
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-sm font-semibold text-slate-900">Attachment</h2>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-blue-600 transition"
                >
                  <FontAwesomeIcon icon={faUpload} size="xs" />
                  Upload File
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              </div>
              {attachment && (
                <p className="text-sm text-gray-600 mb-4">
                  📎{" "}
                  {typeof attachment === "string"
                    ? attachment.split("/").pop()
                    : (attachment as File).name}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-6">
                <Link href="/finance/purchase">
                  <button className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600">
                    Cancel
                  </button>
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notifModal.open}
        title={notifModal.title}
        message={notifModal.message}
        type={notifModal.type}
        onClose={handleNotifClose}
      />
    </div>
  );
}