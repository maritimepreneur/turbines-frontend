import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partnerService, Partner, PartnerListParams } from '@/services/partnerService'
import toast from 'react-hot-toast'

export const usePartners = (params?: PartnerListParams) => {
  return useQuery({
    queryKey: ['partners', params],
    queryFn: () => partnerService.getPartners(params),
  })
}

export const usePartner = (id: number) => {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: () => partnerService.getPartner(id),
    enabled: !!id,
  })
}

export const useCreatePartner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: partnerService.createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      toast.success('Partner berhasil ditambahkan')
    },
    onError: () => {
      toast.error('Gagal menambahkan partner')
    }
  })
}

export const useUpdatePartner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Partner, 'id'> }) =>
      partnerService.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      toast.success('Partner berhasil diupdate')
    },
    onError: () => {
      toast.error('Gagal mengupdate partner')
    }
  })
}

export const useDeletePartner = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: partnerService.deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      toast.success('Partner berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus partner')
    }
  })
}