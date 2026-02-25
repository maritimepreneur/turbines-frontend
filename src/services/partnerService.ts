import axiosInstance from '@/lib/axios'
import { PaginatedResponse } from '@/types/api'

export interface Partner {
  id: number
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string
  service?: string
  goods?: string
}

export interface PartnerListParams {
  page_size?: number
  page_number?: number
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
  search?: string
  industries?: string[]
  company_types?: string[]
  partner_types?: string[]
  services?: string[]
  goods?: string[]
}

export const partnerService = {
  async getPartners(params?: PartnerListParams): Promise<PaginatedResponse<Partner>> {
    const response = await axiosInstance.get('/api/partners', { params })
    return response.data
  },

  async getPartner(id: number): Promise<Partner> {
    const response = await axiosInstance.get(`/api/partners/${id}`)
    return response.data.data || response.data
  },

  async createPartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
    const response = await axiosInstance.post('/api/partners/create', partner)
    return response.data.data || response.data
  },

  async updatePartner(id: number, partner: Omit<Partner, 'id'>): Promise<Partner> {
    const response = await axiosInstance.put(`/api/partners/${id}`, partner)
    return response.data.data || response.data
  },

  async deletePartner(id: number): Promise<void> {
    await axiosInstance.delete(`/api/partners/${id}`)
  }
}