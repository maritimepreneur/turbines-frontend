export interface Document {
    id: number;
    number: number;
    name: string;
    document_type: string;
    project_id: number | null;
    quotation_id: number | null;
    created_at?: string;
    updated_at?: string;
    // helper fields if API returns joined data
    partner_name?: string;
    contact_name?: string;
    lead_name?: string;
}

export interface DocumentsResponse {
    message: string;
    code: number;
    data: {
        list: Document[];
        pagination: {
            current_page: number;
            page_size: number;
            total_pages: number;
            total_items: number;
        };
    };
}

export const DOCUMENT_TYPES = [
    { value: 'OTHER', label: 'Other' },
    { value: 'RECOMENDATION', label: 'Recommendation Letter' }, // Note: API expects typo 'RECOMENDATION'
    { value: 'PO', label: 'Purchase Order' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'MOU', label: 'MOU' },
    { value: 'TAX', label: 'Tax' },
    { value: 'REPORT', label: 'Report' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'AGREEMENT', label: 'Agreement' },
    { value: 'QUOTATION', label: 'Quotation' }
];
