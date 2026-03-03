import axiosInstance from '@/lib/axios';
import { Contact } from '@/types/contact';

/**
 * Ambil semua contact dari backend
 */
export async function getContactList(): Promise<Contact[]> {
    const response = await axiosInstance.get('/api/contacts/');
    if (Array.isArray(response.data)) {
        return response.data;
    }
    return response.data?.data ?? response.data ?? [];
}

/**
 * Ambil satu contact by ID
 */
export async function getContactById(id: number): Promise<Contact> {
    const response = await axiosInstance.get(`/api/contacts/${id}`);
    return response.data?.data ?? response.data;
}
