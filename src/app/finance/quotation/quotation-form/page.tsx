"use client";

import { useQuotationForm } from "@/hooks/useQuotationForm";

export default function QuotationFormPage() {
  const {
    isEditMode,
    loading,
    contacts,
    partners,
    leads,
    showSuccessModal,
    formData,
    errors,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    closeSuccessModal,
  } = useQuotationForm();

  return (
    <div>
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Success!</h3>
              <p className="text-sm text-gray-600 mb-6">Quotation {isEditMode ? 'updated' : 'created'} successfully</p>
              <button
                onClick={closeSuccessModal}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-sm text-slate-400">Finance</p>
        <h1 className="text-2xl font-semibold mt-1 text-black">{isEditMode ? 'Edit' : 'Create New'} Quotation</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm text-black">
        {submitError && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-xs text-red-600 mt-1">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="h-[calc(120vh-240px)] overflow-y-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Total Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="flex items-center justify-center px-4 h-10 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg text-gray-700 font-medium text-sm">Rp</span>
                    <input
                      type="text"
                      name="total_amount"
                      value={formData.total_amount}
                      onChange={handleChange}
                      placeholder="0"
                      className={`flex-1 h-10 px-4 border rounded-r-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 ${
                        errors.total_amount ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  <div className={errors.total_amount ? "" : "mb-3"}>
                    {errors.total_amount && (
                      <p className="text-xs text-red-500 mt-1 mb-2">{errors.total_amount}</p>
                    )}
                  </div>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Contact
                  </label>
                  <select
                    name="contact_id"
                    value={formData.contact_id}
                    onChange={handleChange}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  >
                    <option value="">Select Contact</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} - {contact.company}
                      </option>
                    ))}
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Partner
                  </label>
                  <select
                    name="partner_id"
                    value={formData.partner_id}
                    onChange={handleChange}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  >
                    <option value="">Select Partner</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>

                  <label className="text-xs font-semibold text-black block mb-1">
                    Lead
                  </label>
                  <select
                    name="lead_id"
                    value={formData.lead_id}
                    onChange={handleChange}
                    className="w-full h-10 mb-4 px-4 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200"
                  >
                    <option value="">Select Lead</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-black block mb-1">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter quotation summary"
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-vertical"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Document Content
                  </label>
                  <textarea
                    name="document_content"
                    value={formData.document_content}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter document content"
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-vertical"
                  />

                  <label className="text-xs font-semibold text-black block mb-1">
                    Offering Letter
                  </label>
                  <textarea
                    name="offering_letter"
                    value={formData.offering_letter}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter offering letter content"
                    className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-200 resize-vertical"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

