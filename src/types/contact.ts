export interface Contact {
    id: number;
    name?: string;
    partner_id?: number;
    partnerId?: number;
    partner?: {
        id: number;
        name?: string;
    };
    emails?: string[];
    phone?: string;
    created_at?: string;
    updated_at?: string;
}
