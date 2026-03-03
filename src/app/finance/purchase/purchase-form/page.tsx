"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { usePartners } from "@/hooks/usePartners";
import { useCreatePurchaseOrder, useUpdatePurchaseOrder, usePurchaseOrder, useQuotations } from "@/hooks/usePurchaseOrder";
import { getContactList } from "@/services/contactService";
import { Contact } from "@/types/contact";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function PurchaseOrderFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poId = searchParams.get("id");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [partnerId, setPartnerId] = useState<number | "">("");
  const [contactId, setContactId] = useState<number | "">("");
  const [quotationId, setQuotationId] = useState<number | "">("");
  const [attachment, setAttachment] = useState<File | string | null>(null);
  const [type, setType] = useState<"service" | "goods" | "">("");

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);

  const { data: partners = [], isLoading: partnersLoading } = usePartners();
  const { data: quotations = [], isLoading: quotationsLoading } = useQuotations();
  const { data: poData, isLoading: poLoading } = usePurchaseOrder(Number(poId));
  const createPO = useCreatePurchaseOrder();
  const updatePO = useUpdatePurchaseOrder(Number(poId));

  const isLoading = partnersLoading || quotationsLoading || (!!poId && poLoading);

  // ✅ Hydrate form saat edit
  useEffect(() => {
    if (poData && poId) {
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
    }
  }, [poData, poId]);

  // ✅ FIX: Fetch contacts saat partnerId berubah (terpisah dari reset contactId)
  useEffect(() => {
    const fetchContacts = async () => {
      if (!partnerId) {
        setContacts([]);
        return;
      }
      setContactsLoading(true);
      try {
        const response = await getContactList();
        const allContacts: Contact[] = Array.isArray(response) ? response : [];
        const filtered = allContacts.filter(
          (c: any) =>
            Number(c.partner_id) === Number(partnerId) ||
            Number(c.partnerId) === Number(partnerId) ||
            Number(c.partner?.id) === Number(partnerId)
        );
        setContacts(filtered);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setContacts([]);
      } finally {
        setContactsLoading(false);
      }
    };

    fetchContacts();
  }, [partnerId]);

  // ✅ FIX: Reset contactId HANYA saat user manual ganti partner, bukan saat hydrate
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
      toast.error("Mohon lengkapi semua field, termasuk Type");
      return;
    }

    const payload = {
      partner_id: Number(partnerId),
      contact_id: Number(contactId),
      quotation_id: Number(quotationId),
      attachments: attachment, // ✅ Pass direct (File, string, or null)
      type,
    };

    if (poId) {
      updatePO.mutate(payload, {
        onSuccess: () => router.push("/finance/purchase"),
        onError: (err: any) => {
          toast.error(err?.message || "Gagal update Purchase Order");
        },
      });
    } else {
      createPO.mutate(payload, {
        onSuccess: () => router.push("/finance/purchase"),
        onError: (err: any) => {
          toast.error(err?.message || "Gagal membuat Purchase Order");
        },
      });
    }
  };

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
          {isLoading ? (
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
                  <option value="">{partnersLoading ? "Loading..." : "Select Client"}</option>
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
                  <option value="">{quotationsLoading ? "Loading..." : "Select Quotation"}</option>
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
                  disabled={createPO.isPending || updatePO.isPending}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPO.isPending || updatePO.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}