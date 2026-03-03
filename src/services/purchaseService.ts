import axiosInstance from '@/lib/axios'
import { PurchaseOrder, CreatePurchaseOrderPayload } from '@/types/purchaseOrder'

export const purchaseService = {
    async getPurchaseOrders(): Promise<PurchaseOrder[]> {
        const response = await axiosInstance.get('/api/purchase-orders/')
        console.log(' PO LIST RAW:', JSON.stringify(response.data, null, 2))
        const data = response.data?.data?.list || response.data?.data || response.data || []
        return Array.isArray(data) ? data : []
    },

    async getPurchaseOrder(id: number): Promise<PurchaseOrder> {
        const response = await axiosInstance.get(`/api/purchase-orders/${id}`)
        return response.data?.data || response.data
    },

    async createPurchaseOrder(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
        const hasFile = payload.attachments instanceof File

        if (hasFile) {
            const formData = new FormData()
            formData.append('partner_id', String(payload.partner_id))
            formData.append('contact_id', String(payload.contact_id))
            formData.append('quotation_id', String(payload.quotation_id))
            formData.append('attachments', payload.attachments as File)
            formData.append('type', payload.type)

            try {
                const response = await axiosInstance.post('/api/purchase-orders/create', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                console.log(' CREATE PO RESPONSE:', response.data)
                return response.data?.data || response.data
            } catch (err: any) {
                console.error(' CREATE PO ERROR (FormData):', err.response?.data)
                throw err
            }
        } else {
            const jsonPayload = {
                partner_id: Number(payload.partner_id),
                contact_id: Number(payload.contact_id),
                quotation_id: Number(payload.quotation_id),
                attachments: typeof payload.attachments === 'string' ? payload.attachments : '',
                type: payload.type,
            }

            console.log(' CREATE PO (JSON):', jsonPayload)

            try {
                const response = await axiosInstance.post('/api/purchase-orders/create', jsonPayload)
                console.log(' CREATE PO RESPONSE:', response.data)
                return response.data?.data || response.data
            } catch (err: any) {
                console.error(' CREATE PO ERROR (JSON):', err.response?.data)
                throw err
            }
        }
    },

    async updatePurchaseOrder(id: number, payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
        const hasFile = payload.attachments instanceof File

        if (hasFile) {
            const formData = new FormData()
            formData.append('partner_id', String(payload.partner_id))
            formData.append('contact_id', String(payload.contact_id))
            formData.append('quotation_id', String(payload.quotation_id))
            formData.append('attachments', payload.attachments as File)
            formData.append('type', payload.type)

            try {
                const response = await axiosInstance.put(`/api/purchase-orders/update/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                console.log(' UPDATE PO RESPONSE:', response.data)
                return response.data?.data || response.data
            } catch (err: any) {
                console.error(' UPDATE PO ERROR (FormData):', err.response?.data)
                throw err
            }
        } else {
            const jsonPayload = {
                partner_id: Number(payload.partner_id),
                contact_id: Number(payload.contact_id),
                quotation_id: Number(payload.quotation_id),
                attachments: typeof payload.attachments === 'string' ? payload.attachments : '',
                type: payload.type,
            }

            try {
                const response = await axiosInstance.put(`/api/purchase-orders/update/${id}`, jsonPayload)
                console.log(' UPDATE PO RESPONSE:', response.data)
                return response.data?.data || response.data
            } catch (err: any) {
                console.error(' UPDATE PO ERROR (JSON):', err.response?.data)
                throw err
            }
        }
    },

    async getQuotations(): Promise<any[]> {
        try {
            const response = await axiosInstance.get('/api/quotations/')
            const data = response.data?.data?.list || response.data?.data || response.data || []
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error(' Gagal mengambil quotations:', error)
            return []
        }
    },
}