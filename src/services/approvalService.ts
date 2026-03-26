import axiosInstance from '@/lib/axios';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export type Approval = {
  id: number;
  approval_id: string;
  code: string;
  type: string;
  date: string;
  status: ApprovalStatus;
  quotation_id: number | null;
  po_id: number | null;
  invoice_id: number | null;
  expense_id: number | null;
  lead_id: number | null;
};

export type PaginatedApprovals = {
  code: number;
  message: string;
  data: {
    list: Approval[];
    pagination: {
      current_page: number;
      page_size: number;
      total_pages: number;
      total_items: number;
    };
  };
};

export type SingleApproval = {
  code: number;
  message: string;
  data: Approval;
};

export type GetApprovalsParams = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
};

export type CreateApprovalPayload = {
  entity_type: string;
  quotation_id?: number | null;
  po_id?: number | null;
  invoice_id?: number | null;
  expense_id?: number | null;
  lead_id?: number | null;
};

export type UpdateApprovalPayload = {
  status: 'Approved' | 'Rejected';
};

const approvalsService = {
  getAll: (params?: GetApprovalsParams) =>
    axiosInstance.get<PaginatedApprovals>('/api/approvals/', { params }),

  getById: (id: string) =>
    axiosInstance.get<SingleApproval>(`/api/approvals/${id}`),

  create: (payload: CreateApprovalPayload) =>
    axiosInstance.post<Approval>('/api/approvals/create', payload),

  updateStatus: (id: string, payload: UpdateApprovalPayload) =>
    axiosInstance.put<Approval>(`/api/approvals/update/${id}`, payload),

  delete: (id: string) =>
    axiosInstance.delete(`/api/approvals/${id}`),
};

export default approvalsService;