import axiosInstance from '@/lib/axios';

export interface Invoice {
  id: number;
  invoice_number: string;
  company_id: string;
  client_name: string;
  creation_date: string;
  invoice_period: string;
  grand_total: number;
  status: 'Pre Invoice' | 'Invoice' | 'Canceled';
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
}

export interface InvoiceFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  invoice_period?: string;
  client_name?: string;
}

export const invoiceService = {
  /**
   * Search and Filter Invoices with Pagination
   * POST /api3/invoices/
   */
  async getInvoices(params?: InvoiceFilterParams): Promise<InvoiceListResponse> {
    try {
      const response = await axiosInstance.post('/api3/invoices/', params || {});
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  /**
   * Get All Invoices
   * GET /api3/invoices/
   */
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const response = await axiosInstance.get('/api3/invoices/');
      return response.data;
    } catch (error) {
      console.error('Error fetching all invoices:', error);
      throw error;
    }
  },

  /**
   * Get Invoice Detail by ID
   * GET /api3/invoices/{id}
   */
  async getInvoiceById(id: number): Promise<Invoice> {
    try {
      const response = await axiosInstance.get(`/api3/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create New Invoice
   * POST /api3/invoices/create
   */
  async createInvoice(data: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await axiosInstance.post('/api3/invoices/create', data);
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  /**
   * Update Invoice Detail
   * PUT /api3/invoices/{id}
   */
  async updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await axiosInstance.put(`/api3/invoices/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating invoice ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete Invoice
   * DELETE /api3/invoices/{id}
   */
  async deleteInvoice(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api3/invoices/${id}`);
    } catch (error) {
      console.error(`Error deleting invoice ${id}:`, error);
      throw error;
    }
  },
};