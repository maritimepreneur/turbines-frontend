"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuotationFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    total_amount: "",
    document_content: "",
    summary: "",
    offering_letter: "",
    contact_id: "",
    partner_id: "",
    lead_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        const [contactsRes, partnersRes, leadsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/contacts/`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/partners/`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}api/leads/partner-list`, { headers }),
        ]);

        if (contactsRes.ok) {
          const data = await contactsRes.json();
          setContacts(data.data || []);
        }
        if (partnersRes.ok) {
          const data = await partnersRes.json();
          setPartners(data.data || []);
        }
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setLeads(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      
      const payload = {
        total_amount: formData.total_amount,
        document_content: formData.document_content,
        summary: formData.summary,
        offering_letter: formData.offering_letter,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : 0,
        partner_id: formData.partner_id ? parseInt(formData.partner_id) : 0,
        lead_id: formData.lead_id ? parseInt(formData.lead_id) : 0,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}api/quotations/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create quotation");
      }

      alert("Quotation created successfully!");
      router.push("/finance/quotation");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mt-1 text-black">
          Quotation Form
        </h1>
        <p className="text-sm text-slate-400">
          <span className="text-blue-600">Quotation/New</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-lg text-black">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Total Amount
                </label>
                <input
                  type="text"
                  name="total_amount"
                  value={formData.total_amount}
                  onChange={handleChange}
                  required
                  className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Contact
                </label>
                <select
                  name="contact_id"
                  value={formData.contact_id}
                  onChange={handleChange}
                  className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                >
                  <option value="">Select Contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Partner
                </label>
                <select
                  name="partner_id"
                  value={formData.partner_id}
                  onChange={handleChange}
                  className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                >
                  <option value="">Select Partner</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">
                  Lead
                </label>
                <select
                  name="lead_id"
                  value={formData.lead_id}
                  onChange={handleChange}
                  className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0 pt-2">
                  Summary
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-start gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0 pt-2">
                  Document Content
                </label>
                <textarea
                  name="document_content"
                  value={formData.document_content}
                  onChange={handleChange}
                  rows={4}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-start gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0 pt-2">
                  Offering Letter
                </label>
                <textarea
                  name="offering_letter"
                  value={formData.offering_letter}
                  onChange={handleChange}
                  rows={4}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Link href="/finance/quotation">
                <button
                  type="button"
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
