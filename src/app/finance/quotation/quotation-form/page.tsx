"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

export default function QuotationFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
      try {
        setLoadingData(true);
        console.log("🔄 Fetching form data...");

        // Fetch contacts
        let contactsData: any[] = [];
        try {
          const contactsRes = await axiosInstance.get('/api/contacts/');
          console.log("📦 Contacts Response:", contactsRes.data);
          contactsData = contactsRes.data.data || [];
          console.log(`✅ Loaded ${contactsData.length} contacts`);
        } catch (error) {
          console.error("❌ Error fetching contacts:", error);
        }

        // Fetch partners
        let partnersData: any[] = [];
        try {
          const partnersRes = await axiosInstance.get('/api/partners/');
          console.log("📦 Partners Response:", partnersRes.data);
          partnersData = partnersRes.data.data || [];
          console.log(`✅ Loaded ${partnersData.length} partners`);
        } catch (error) {
          console.error("❌ Error fetching partners:", error);
        }

        // Fetch leads - menggunakan GET ke partner-list
        let leadsData: any[] = [];
        try {
          const leadsRes = await axiosInstance.get('/api/leads/partner-list');
          console.log("📦 Leads Response:", leadsRes.data);

          // Extract data dari response
          leadsData = leadsRes.data.data || [];
          console.log(`✅ Loaded ${leadsData.length} leads`);
        } catch (error) {
          console.error("❌ Error fetching leads:", error);
        }

        // Set state
        setContacts(contactsData);
        setPartners(partnersData);
        setLeads(leadsData);

        console.log("✅ All form data loaded successfully");
      } catch (error: any) {
        console.error("❌ Error fetching data:", error);
        console.error("❌ Error details:", error.response?.data || error.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📤 Submitting quotation...");

      const payload = {
        total_amount: formData.total_amount,
        document_content: formData.document_content,
        summary: formData.summary,
        offering_letter: formData.offering_letter,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : 0,
        partner_id: formData.partner_id ? parseInt(formData.partner_id) : 0,
        lead_id: formData.lead_id ? parseInt(formData.lead_id) : 0,
      };

      console.log("📦 Payload:", payload);

      const response = await axiosInstance.post('/api/quotations/create', payload);

      console.log("✅ Response:", response.data);

      if (response.data.code === 200 || response.status === 200) {
        alert("Quotation created successfully!");
        router.push("/finance/quotation");
      } else {
        throw new Error(response.data.message || "Failed to create quotation");
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      alert(error.response?.data?.message || "An error occurred while creating quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-400">
          Finance / Quotation / <span className="text-slate-600">New</span>
        </p>
        <h1 className="text-2xl font-semibold mt-1 text-black">
          Create New Quotation
        </h1>
      </div>

      {loadingData ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Loading form data...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-xl shadow-lg text-black">
            <div className="p-6">
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="text-xs font-semibold text-black sm:w-32 sm:flex-shrink-0">
                    Total Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleChange}
                    required
                    placeholder="Enter total amount"
                    className="w-full sm:flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="text-xs font-semibold text-black sm:w-32 sm:flex-shrink-0">
                    Contact
                  </label>
                  <select
                    name="contact_id"
                    value={formData.contact_id}
                    onChange={handleChange}
                    disabled={loadingData}
                    className="w-full sm:flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingData ? "Loading contacts..." : contacts.length > 0 ? "Select Contact" : "No contacts available"}
                    </option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="text-xs font-semibold text-black sm:w-32 sm:flex-shrink-0">
                    Partner
                  </label>
                  <select
                    name="partner_id"
                    value={formData.partner_id}
                    onChange={handleChange}
                    disabled={loadingData}
                    className="w-full sm:flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingData ? "Loading partners..." : partners.length > 0 ? "Select Partner" : "No partners available"}
                    </option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="text-xs font-semibold text-black sm:w-32 sm:flex-shrink-0">
                    Lead
                  </label>
                  <select
                    name="lead_id"
                    value={formData.lead_id}
                    onChange={handleChange}
                    disabled={loadingData}
                    className="w-full sm:flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {loadingData ? "Loading leads..." : leads.length > 0 ? "Select Lead" : "No leads available"}
                    </option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 mb-4">
                  <label className="text-xs font-semibold text-black sm:w-32 sm:flex-shrink-0 sm:pt-2">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter summary"
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 mb-4">
                  <label className="text-xs font-semibold text-black sm:w-32 sm:flex-shrink-0 sm:pt-2">
                    Document Content
                  </label>
                  <textarea
                    name="document_content"
                    value={formData.document_content}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter document content"
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 mb-4">
                  <label className="text-xs font-semibold text-black sm:w-32 sm:flex-shrink-0 sm:pt-2">
                    Offering Letter
                  </label>
                  <textarea
                    name="offering_letter"
                    value={formData.offering_letter}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter offering letter"
                    className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <Link href="/finance/quotation">
                  <button
                    type="button"
                    className="px-6 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    "Create Quotation"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
