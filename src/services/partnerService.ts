// import axiosInstance from '@/lib/axios'

// export interface Partner {
//   id: number
//   name: string
//   initials: string
//   industry: string
//   company_type: string
//   partner_type: string
//   service?: string
//   goods?: string
// }

// export const partnerService = {
//   async getPartners(): Promise<Partner[]> {
//     const response = await axiosInstance.get('/api/partners/')
//     return response.data.data || response.data
//   },

//   async getPartner(id: number): Promise<Partner> {
//     const response = await axiosInstance.get(`/api/partners/${id}`)
//     return response.data.data || response.data
//   },

//   async createPartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
//     const response = await axiosInstance.post('/api/partners/create', partner)
//     return response.data.data || response.data
//   },

//   async updatePartner(id: number, partner: Omit<Partner, 'id'>): Promise<Partner> {
//     const response = await axiosInstance.put(`/api/partners/${id}`, partner)
//     return response.data.data || response.data
//   },

//   async deletePartner(id: number): Promise<void> {
//     await axiosInstance.delete(`/api/partners/${id}`)
//   }
// }