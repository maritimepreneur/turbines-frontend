export interface PurchaseOrder {
    id: number;
    number?: string;
    partner_id: number;
    contact_id: number;
    quotation_id: number;
    attachments?: string | string[] | null;
    type: "service" | "goods" | string;
    status?: string;
    created_at?: string;
    updated_at?: string;

    // Relasi (populated dari backend)
    partner?: {
        id: number;
        name: string;
        initials?: string;
    };
    contact?: {
        id: number;
        name: string;
    };
    quotation?: {
        id: number;
        summary?: string;
        number?: string;
        name?: string;
    };
}

export interface CreatePurchaseOrderPayload {
    partner_id: number;
    contact_id: number;
    quotation_id: number;
    attachments?: string | File | null;
    type: "service" | "goods" | string;
}

export interface Quotation {
    id: number;
    number?: string;
    name?: string;
    summary?: string;
    partner_id?: number;
    created_at?: string;
    updated_at?: string;
}
