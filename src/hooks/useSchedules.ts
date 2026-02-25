import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  scheduleService,
  CreateSchedulePayload,
} from '@/services/scheduleService'
import toast from 'react-hot-toast'

export const useSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: scheduleService.getSchedules,
  })
}

export const useCreateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSchedulePayload) =>
      scheduleService.createSchedule(payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onSuccess: () => {
      toast.success('Event berhasil ditambahkan')
    },
    onError: () => {
      toast.error('Gagal menambahkan event')
    },
  })
}

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSchedulePayload> }) =>
      scheduleService.updateSchedule(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onSuccess: () => {
      toast.success('Event berhasil diupdate')
    },
    onError: () => {
      toast.error('Gagal mengupdate event')
    },
  })
}

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => scheduleService.deleteSchedule(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
    onSuccess: () => {
      toast.success('Event berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus event')
    },
  })
}
