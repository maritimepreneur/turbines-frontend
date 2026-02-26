"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from '@/lib/axios';

export default function InvoiceFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    period: "",
    due_date: "",
    billed_amount: "",
    total_amount: "",
    notes: "",
    vat: "0.00",
    pph: "0.00",
    overheads: "0.00",
    discount: "0.00",
    grand_total: "",
    payment_details: "",
    agreement_letter: "",
    contact_id: "",
    partner_id: "",
    purchase_order_id: "",
  });

  useEffect(() => {
    if (invoiceId) {
      setIsEditMode(true);
      fetchInvoiceDetail();
    }
  }, [invoiceId]);

  const fetchInvoiceDetail = async () => {
    try {
      const response = await axiosInstance.get(`/api/invoices/${invoiceId}`);
      const data = response.data.data;
      setFormData({
        number: data.number || "",
        period: data.period || "",
        due_date: data.due_date || "",
        billed_amount: data.billed_amount?.toString() || "",
        total_amount: data.total_amount?.toString() || "",
        notes: data.notes || "",
        vat: data.vat?.toString() || "0.00",
        pph: data.pph?.toString() || "0.00",
        overheads: data.overheads?.toString() || "0.00",
        discount: data.discount?.toString() || "0.00",
        grand_total: data.grand_total || "",
        payment_details: data.payment_details || "",
        agreement_letter: data.agreement_letter || "",
        contact_id: data.contact?.id?.toString() || "",
        partner_id: data.partner?.id?.toString() || "",
        purchase_order_id: data.purchase_order?.id?.toString() || "",
      });
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        number: parseInt(formData.number) || 0,
        period: formData.period,
        due_date: formData.due_date,
        billed_amount: formData.billed_amount,
        total_amount: formData.total_amount,
        notes: formData.notes,
        vat: formData.vat,
        pph: formData.pph,
        overheads: formData.overheads,
        discount: formData.discount,
        grand_total: formData.grand_total,
        payment_details: formData.payment_details,
        agreement_letter: formData.agreement_letter,
        contact_id: parseInt(formData.contact_id) || 0,
        partner_id: parseInt(formData.partner_id) || 0,
        purchase_order_id: parseInt(formData.purchase_order_id) || 0,
      };

      if (isEditMode) {
        await axiosInstance.put(`/api/invoices/${invoiceId}`, payload);
        alert("Invoice updated successfully!");
        router.push("/finance/invoice");
      } else {
        await axiosInstance.post('/api/invoices/create', payload);
        alert("Invoice created successfully!");
        router.push("/finance/invoice");
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || "An error occurred";
      alert(`Failed to ${isEditMode ? 'update' : 'create'} invoice: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mt-1 text-black">
          {isEditMode ? "Edit Invoice" : "Invoice Form"}
        </h1>
        <p className="text-sm text-slate-400">
          <span className="text-blue-600">
            Invoice/{isEditMode ? formData.number : "New"}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-lg text-black">
          <div className="p-6">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Number</label>
                <input type="number" name="number" value={formData.number} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Period</label>
                <input type="text" name="period" value={formData.period} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Due Date</label>
                <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Billed Amount</label>
                <input type="text" name="billed_amount" value={formData.billed_amount} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Total Amount</label>
                <input type="text" name="total_amount" value={formData.total_amount} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleChange} className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">VAT</label>
                <input type="text" name="vat" value={formData.vat} onChange={handleChange} className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">PPH</label>
                <input type="text" name="pph" value={formData.pph} onChange={handleChange} className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Overheads</label>
                <input type="text" name="overheads" value={formData.overheads} onChange={handleChange} className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Discount</label>
                <input type="text" name="discount" value={formData.discount} onChange={handleChange} className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Grand Total</label>
                <input type="text" name="grand_total" value={formData.grand_total} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Payment Details</label>
                <input type="text" name="payment_details" value={formData.payment_details} onChange={handleChange} className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Agreement Letter</label>
                <input type="text" name="agreement_letter" value={formData.agreement_letter} onChange={handleChange} className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Contact ID</label>
                <input type="number" name="contact_id" value={formData.contact_id} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">Partner ID</label>
                <input type="number" name="partner_id" value={formData.partner_id} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-xs font-semibold text-black w-32 flex-shrink-0">PO ID</label>
                <input type="number" name="purchase_order_id" value={formData.purchase_order_id} onChange={handleChange} required className="flex-1 h-10 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Link href="/finance/invoice">
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
                {loading ? "Submitting..." : isEditMode ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
