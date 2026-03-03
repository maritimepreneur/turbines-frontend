import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

export interface Partner {
    id: number;
    name: string;
    initials: string;
    industry?: string;
    company_type?: string;
    partner_type?: string;
}

async function getPartners(): Promise<Partner[]> {
    const response = await axiosInstance.get('/api/partners/');
    if (Array.isArray(response.data)) {
        return response.data;
    }
    return response.data?.data ?? response.data ?? [];
}

export const usePartners = () => {
    return useQuery({
        queryKey: ['partners'],
        queryFn: getPartners,
    });
};
