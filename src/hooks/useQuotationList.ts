import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quotationService } from "@/services/quotationService";

type Lead = {
  number: string;
  name: string;
  projectname: string;
  total: string;
};

export const useQuotationList = () => {
  const router = useRouter();
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [notifModal, setNotifModal] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await quotationService.getQuotations();

      if (!response || response.code !== 200) {
        throw new Error("Invalid API response");
      }

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid data format");
      }

      const mappedData: Lead[] = response.data.map((item: any) => ({
        number: item.id?.toString() || "-",
        name: item.contact?.name || "-",
        projectname: item.lead?.name || "-",
        total: item.total_amount
          ? `Rp ${Number(item.total_amount).toLocaleString('id-ID')}`
          : "Rp 0",
      }));
      setLeadsData(mappedData);
    } catch (error: any) {
      setLeadsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleEdit = (quotationId: string) => {
    router.push(`/finance/quotation/quotation-form?number=${quotationId}`);
  };

  const handleDelete = (quotationId: string) => {
    setDeleteModal({ show: true, id: quotationId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    try {
      setIsDeleting(deleteModal.id);
      await quotationService.deleteQuotation(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      setNotifModal({ show: true, type: 'success', message: 'Quotation deleted successfully!' });
      await fetchQuotations();
    } catch (error) {
      setDeleteModal({ show: false, id: null });
      setNotifModal({ show: true, type: 'error', message: 'Failed to delete quotation. Please try again.' });
    } finally {
      setIsDeleting(null);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, id: null });
  };

  const closeNotifModal = () => {
    setNotifModal({ show: false, type: 'success', message: '' });
  };

  return {
    leadsData,
    loading,
    isDeleting,
    deleteModal,
    notifModal,
    fetchQuotations,
    handleEdit,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
    closeNotifModal,
  };
};
