import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { quotationService } from "@/services/quotationService";

export const useQuotationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("number");
  const isEditMode = !!quotationId;
  
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    total_amount: "",
    document_content: "",
    summary: "",
    offering_letter: "",
    contact_id: "",
    partner_id: "",
    lead_id: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, partnersRes, leadsRes] = await Promise.all([
          quotationService.getContacts(),
          quotationService.getPartners(),
          quotationService.getLeads(),
        ]);

        setContacts(contactsRes.data || []);
        setPartners(partnersRes.data || []);
        setLeads(leadsRes.data || []);

        if (isEditMode && quotationId) {
          const quotationRes = await quotationService.getQuotation(quotationId);
          const data = quotationRes.data;
          setFormData({
            total_amount: data.total_amount ? Number(data.total_amount).toLocaleString('id-ID') : "",
            document_content: data.document_content || "",
            summary: data.summary || "",
            offering_letter: data.offering_letter || "",
            contact_id: data.contact?.id ? data.contact.id.toString() : "",
            partner_id: data.partner?.id ? data.partner.id.toString() : "",
            lead_id: data.lead?.id ? data.lead.id.toString() : "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [isEditMode, quotationId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "total_amount") {
      const numericValue = value.replace(/[^0-9]/g, "");
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};
    if (!formData.total_amount.trim()) {
      newErrors.total_amount = "Total amount is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const payload = {
        total_amount: formData.total_amount.replace(/\./g, ""),
        document_content: formData.document_content,
        summary: formData.summary,
        offering_letter: formData.offering_letter,
        contact_id: formData.contact_id ? parseInt(formData.contact_id) : 0,
        partner_id: formData.partner_id ? parseInt(formData.partner_id) : 0,
        lead_id: formData.lead_id ? parseInt(formData.lead_id) : 0,
      };

      const response = isEditMode
        ? await quotationService.updateQuotation(quotationId!, payload)
        : await quotationService.createQuotation(payload);

      if (response.code === 200 || response.code === 201) {
        setShowSuccessModal(true);
      } else {
        throw new Error(response.message || `Failed to ${isEditMode ? 'update' : 'create'} quotation`);
      }
    } catch (error: any) {
      console.error("Error:", error);
      setSubmitError(error.response?.data?.message || error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? All changes will be lost.")) {
      router.push("/finance/quotation");
    }
  };
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    router.push("/finance/quotation");
  }
 

  return {
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
  };
};
