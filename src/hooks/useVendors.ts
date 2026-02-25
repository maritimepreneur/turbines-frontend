import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  vendorService,
  Vendor,
  VendorQueryParams,
  CreateVendorPayload,
} from '@/services/vendorService'
import toast from 'react-hot-toast'

/**
 * Fetch vendors dengan server-side search / filter / sort / pagination.
 * Query key menyertakan params sehingga React Query otomatis re-fetch
 * setiap kali params berubah.
 */
export const useVendors = (params: VendorQueryParams = {}) => {
  return useQuery({
    queryKey: ['vendors', params],
    queryFn: () => vendorService.getVendors(params),
    placeholderData: (prev) => prev, // keep previous data while loading (like keepPreviousData)
  })
}

export const useVendor = (id: number) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => vendorService.getVendor(id),
    enabled: !!id,
  })
}

export const useCreateVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateVendorPayload) => vendorService.createVendor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor berhasil ditambahkan')
    },
    onError: () => {
      toast.error('Gagal menambahkan vendor')
    },
  })
}

export const useUpdateVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateVendorPayload> }) =>
      vendorService.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      toast.success('Vendor berhasil diupdate')
    },
    onError: () => {
      toast.error('Gagal mengupdate vendor')
    },
  })
}

export const useDeleteVendor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: vendorService.deleteVendor,
    onSettled: () => {
      // Selalu invalidate cache setelah delete, sukses maupun error,
      // karena backend sudah menghapus data meskipun response-nya tidak standar
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
    onSuccess: () => {
      toast.success('Vendor berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus vendor')
    },
  })
}
