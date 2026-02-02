import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { toast } from 'react-hot-toast';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

// Generic hook untuk GET request
export function useApiQuery<T>(
  queryKey: any[],
  url: string,
  params?: any,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey,
    queryFn: () => apiService.get<T>(url, params),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime,
  });
}

// Generic hook untuk GET dengan pagination
export function useApiPaginatedQuery<T>(
  queryKey: any[],
  url: string,
  params?: any,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey,
    queryFn: () => apiService.getPaginated<T>(url, params),
    enabled: options?.enabled ?? true,
  });
}

// Generic hook untuk POST/PUT/DELETE
export function useApiMutation(
  method: 'post' | 'put' | 'patch' | 'delete',
  invalidateKeys?: any[][],
  options?: UseApiOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, data }: { url: string; data?: any }) => {
      return apiService[method](url, data);
    },
    onSuccess: (data) => {
      // Invalidate queries
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      // Show success toast
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      // Call custom success handler
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: any) => {
      // Show error toast
      const errorMessage =
        options?.errorMessage ||
        error.response?.data?.message ||
        'Terjadi kesalahan';
      toast.error(errorMessage);

      // Call custom error handler
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
}

// Hook khusus untuk upload file
export function useFileUpload(
  invalidateKeys?: any[][],
  options?: UseApiOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ url, formData }: { url: string; formData: FormData }) => {
      return apiService.postFormData(url, formData);
    },
    onSuccess: (data) => {
      if (invalidateKeys) {
        invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }

      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        options?.errorMessage ||
        error.response?.data?.message ||
        'Upload gagal';
      toast.error(errorMessage);

      if (options?.onError) {
        options.onError(error);
      }
    },
  });
}