import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseService } from '@/services/purchaseService'
import { CreatePurchaseOrderPayload } from '@/types/purchaseOrder'
import toast from 'react-hot-toast'

export const usePurchaseOrders = () => {
    return useQuery({
        queryKey: ['purchase-orders'],
        queryFn: purchaseService.getPurchaseOrders,
    })
}

export const usePurchaseOrder = (id: number) => {
    return useQuery({
        queryKey: ['purchase-order', id],
        queryFn: () => purchaseService.getPurchaseOrder(id),
        enabled: !!id,
    })
}

export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreatePurchaseOrderPayload) =>
            purchaseService.createPurchaseOrder(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            toast.success('Purchase Order berhasil dibuat')
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message
                || error?.response?.data?.detail
                || error?.response?.data?.error
                || JSON.stringify(error?.response?.data)
                || 'Gagal membuat Purchase Order'
            console.error(' CREATE PO ERROR:', error?.response?.data)
            toast.error(`Error: ${msg}`)
        },
    })
}

export const useUpdatePurchaseOrder = (id: number) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreatePurchaseOrderPayload) =>
            purchaseService.updatePurchaseOrder(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
            toast.success('Purchase Order berhasil diperbarui')
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message
                || error?.response?.data?.detail
                || error?.response?.data?.error
                || JSON.stringify(error?.response?.data)
                || 'Gagal memperbarui Purchase Order'
            console.error(' UPDATE PO ERROR:', error?.response?.data)
            toast.error(`Error: ${msg}`)
        },
    })
}

export const useQuotations = () => {
    return useQuery({
        queryKey: ['quotations'],
        queryFn: purchaseService.getQuotations,
    })
}
