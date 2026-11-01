import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getQuotationsApi,
  getQuotationApi,
  createQuotationApi,
  convertQuotationToOrderApi,
  sendQuotationEmailApi,
  type QuotationsParams,
  type CreateQuotationPayload,
} from '@/api/manager/quotations.api';

const KEYS = {
  all: ['quotations'] as const,
  list: (params: QuotationsParams) => ['quotations', 'list', params] as const,
  detail: (id: string) => ['quotations', 'detail', id] as const,
};

export function useQuotations(params: QuotationsParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getQuotationsApi(params),
    staleTime: 30_000,
  });
}

export function useQuotationsInfinite(params: Omit<QuotationsParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getQuotationsApi({ ...params, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 20 ? pages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getQuotationApi(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateQuotationPayload) => createQuotationApi(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useConvertQuotationToOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => convertQuotationToOrderApi(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
}

export function useSendQuotationEmail() {
  return useMutation({
    mutationFn: (id: string) => sendQuotationEmailApi(id),
  });
}
