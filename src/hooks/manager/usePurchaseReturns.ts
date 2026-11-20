import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getPurchaseReturnsApi,
  getPurchaseReturnApi,
  createPurchaseReturnApi,
  finalizePurchaseReturnApi,
  cancelPurchaseReturnApi,
  type PurchaseReturnsParams,
  type CreatePurchaseReturnPayload,
} from '@/api/manager/purchase-returns.api';

const KEYS = {
  all: ['purchase-returns'] as const,
  list: (params: PurchaseReturnsParams) => ['purchase-returns', 'list', params] as const,
  detail: (id: string) => ['purchase-returns', 'detail', id] as const,
};

export function usePurchaseReturns(params: PurchaseReturnsParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getPurchaseReturnsApi(params),
    staleTime: 30_000,
  });
}

export function usePurchaseReturnsInfinite(params: Omit<PurchaseReturnsParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getPurchaseReturnsApi({ ...params, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 20 ? pages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function usePurchaseReturn(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getPurchaseReturnApi(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreatePurchaseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchaseReturnPayload) => createPurchaseReturnApi(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: KEYS.all }); },
  });
}

export function useFinalizePurchaseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => finalizePurchaseReturnApi(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useCancelPurchaseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelPurchaseReturnApi(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
