import axiosInstance from '@/lib/axios';

export interface Quotation {
  id: number;
  total_amount: string;
  document_content?: string;
  summary?: string;
  offering_letter?: string;
  contact_id?: number;
  partner_id?: number;
  lead_id?: number;
  contact?: {
    name: string;
  };
  lead?: {
    name: string;
  };
}

export interface QuotationPayload {
  total_amount: string;
  document_content?: string;
  summary?: string;
  offering_letter?: string;
  contact_id?: number;
  partner_id?: number;
  lead_id?: number;
}

export const quotationService = {
  async getQuotations() {
    const response = await axiosInstance.get('/api/quotations/');
    return response.data;
  },

  async getQuotation(id: string) {
    const response = await axiosInstance.get(`/api/quotations/${id}`);
    return response.data;
  },

  async createQuotation(payload: QuotationPayload) {
    const response = await axiosInstance.post('/api/quotations/create', payload);
    return response.data;
  },

  async updateQuotation(id: string, payload: QuotationPayload) {
    const response = await axiosInstance.put(`/api/quotations/${id}`, payload);
    return response.data;
  },

  async deleteQuotation(id: string) {
    const response = await axiosInstance.delete(`/api/quotations/${id}`);
    return response.data;
  },

  async getContacts() {
    const response = await axiosInstance.get('/api/contacts/');
    return response.data;
  },

  async getPartners() {
    const response = await axiosInstance.get('/api/partners/');
    return response.data;
  },

  async getLeads() {
    const response = await axiosInstance.get('/api/leads/');
    return response.data;
  }
};
