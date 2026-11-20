import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getSaleReturnsApi,
  getSaleReturnApi,
  createSaleReturnApi,
  finalizeSaleReturnApi,
  cancelSaleReturnApi,
  type SaleReturnsParams,
  type CreateSaleReturnPayload,
} from '@/api/manager/sales-returns.api';

const KEYS = {
  all: ['sale-returns'] as const,
  list: (params: SaleReturnsParams) => ['sale-returns', 'list', params] as const,
  detail: (id: string) => ['sale-returns', 'detail', id] as const,
};

export function useSaleReturns(params: SaleReturnsParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getSaleReturnsApi(params),
    staleTime: 30_000,
  });
}

export function useSaleReturnsInfinite(params: Omit<SaleReturnsParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getSaleReturnsApi({ ...params, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 20 ? pages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function useSaleReturn(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getSaleReturnApi(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateSaleReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSaleReturnPayload) => createSaleReturnApi(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useFinalizeSaleReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => finalizeSaleReturnApi(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useCancelSaleReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelSaleReturnApi(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
