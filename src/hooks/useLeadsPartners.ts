import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'

interface LeadsPartner {
    id: number
    name: string
}

interface LeadsPartnerListParams {
    search?: string
}

// Function to fetch partners for leads
const fetchLeadsPartnerList = async (params?: LeadsPartnerListParams) => {
    const response = await axiosInstance.get('/api/leads/partner-list/', {
        params: params || {}
    })
    console.log('📡 API Response:', response.data)
    // Response structure is: { data: [...] }
    // We want to return the array directly
    return response.data.data || response.data
}

// Custom hook to use partner list for leads
export const useLeadsPartners = (params?: LeadsPartnerListParams) => {
    return useQuery({
        queryKey: ['leads-partners', params],
        queryFn: () => fetchLeadsPartnerList(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}
