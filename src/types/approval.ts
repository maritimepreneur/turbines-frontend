export type ApprovalType = "Quotation" | "Purchase Order" | "Invoice" | "Expense"
export type ApprovalStatus = "New Request" | "Approved" | "Rejected"

export interface Approval {
    approval_id: number
    type: ApprovalType
    code: string
    quotation_id: number | null
    po_id: number | null
    invoice_id: number | null
    expense_id: number | null
    lead_id: number | null
    status?: ApprovalStatus
}

export interface ApprovalPostRequest {
    entity_type: ApprovalType
    quotation_id?: number
    po_id?: number
    invoice_id?: number
    expense_id?: number
}

export interface ApprovalUpdateRequest extends Partial<ApprovalPostRequest> {
    status?: ApprovalStatus
}
