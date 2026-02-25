import axiosInstance from '@/lib/axios'

// ── Interfaces ────────────────────────────────────────────────
export interface Vendor {
  id: number
  name: string
  initials: string
  industry: string
  company_type: string
  partner_type: string   // field dari API response
  vendor_type?: string
  service?: string | string[]
  goods?: string | string[]
}

export interface VendorQueryParams {
  search?: string
  industry?: string
  company_type?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface VendorListResponse {
  data: Vendor[]
  total?: number
  page?: number
  per_page?: number
  total_pages?: number
}

export interface CreateVendorPayload {
  name: string
  initials: string
  industry: string
  company_type: string
  vendor_type?: string
  service?: string | string[]   // API accepts array; edit form sends plain string
  goods?: string | string[]     // API accepts array; edit form sends plain string
}

// ── Service ───────────────────────────────────────────────────
export const vendorService = {
  /**
   * GET /api/vendors/ dengan query params untuk search, filter, sort & pagination
   */
  async getVendors(params: VendorQueryParams = {}): Promise<VendorListResponse> {
    const response = await axiosInstance.get('/api/vendors/', { params })
    // Normalise: backend bisa return { data: [...] } atau langsung array
    if (Array.isArray(response.data)) {
      return { data: response.data }
    }
    return response.data
  },

  async getVendor(id: number): Promise<Vendor> {
    const response = await axiosInstance.get(`/api/vendors/${id}`)
    return response.data.data || response.data
  },

  /**
   * POST /api/vendors/create
   * Payload: { name, initials, industry, company_type, service: [], goods: [] }
   */
  async createVendor(vendor: CreateVendorPayload): Promise<Vendor> {
    const response = await axiosInstance.post('/api/vendors/create', vendor)
    return response.data.data || response.data
  },

  async updateVendor(id: number, vendor: Partial<CreateVendorPayload>): Promise<Vendor> {
    const response = await axiosInstance.put(`/api/vendors/${id}`, vendor)
    return response.data.data || response.data
  },

  async deleteVendor(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/api/vendors/${id}`)
    } catch (err: any) {
      // Jika status 2xx tapi axios throw karena response body tidak standar, abaikan
      const status = err?.response?.status
      if (status && status >= 200 && status < 300) return
      throw err
    }
  },
}
