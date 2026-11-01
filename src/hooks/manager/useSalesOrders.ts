import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getSaleOrdersApi,
  getSaleOrderApi,
  createSaleOrderApi,
  type SaleOrdersParams,
  type CreateSaleOrderPayload,
} from '@/api/manager/sales-orders.api';

const KEYS = {
  all: ['sales-orders'] as const,
  list: (params: SaleOrdersParams) => ['sales-orders', 'list', params] as const,
  detail: (id: string) => ['sales-orders', 'detail', id] as const,
};

export function useSalesOrders(params: SaleOrdersParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getSaleOrdersApi(params),
    staleTime: 30_000,
  });
}

export function useSalesOrdersInfinite(params: Omit<SaleOrdersParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getSaleOrdersApi({ ...params, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 20 ? pages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function useSaleOrder(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getSaleOrderApi(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateSaleOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSaleOrderPayload) => createSaleOrderApi(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
