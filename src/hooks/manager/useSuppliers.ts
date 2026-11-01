import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getSuppliersApi,
  getSupplierApi,
  createSupplierApi,
  type SuppliersParams,
  type CreateSupplierPayload,
} from '@/api/manager/suppliers.api';

const KEYS = {
  all: ['suppliers'] as const,
  list: (params: SuppliersParams) => ['suppliers', 'list', params] as const,
  detail: (id: string) => ['suppliers', 'detail', id] as const,
};

export function useSuppliers(params: SuppliersParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getSuppliersApi(params),
    staleTime: 60_000,
  });
}

export function useSuppliersInfinite(params: Omit<SuppliersParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getSuppliersApi({ ...params, page: pageParam as number, perPage: 30 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 30 ? pages.length + 1 : undefined,
    staleTime: 60_000,
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getSupplierApi(id),
    enabled: Boolean(id),
    staleTime: 120_000,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) => createSupplierApi(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
