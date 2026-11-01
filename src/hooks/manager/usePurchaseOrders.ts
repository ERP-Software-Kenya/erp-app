import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getPurchaseOrdersApi,
  getPurchaseOrderApi,
  createPurchaseOrderApi,
  receiveGoodsApi,
  allocateStockApi,
  recordPurchasePaymentApi,
  getPurchasePaymentsApi,
  type PurchaseOrdersParams,
  type CreatePurchaseOrderPayload,
  type ReceiveGoodsPayload,
  type AllocateStockPayload,
  type RecordPurchasePaymentPayload,
} from '@/api/manager/purchase-orders.api';

const KEYS = {
  all: ['purchase-orders'] as const,
  list: (params: PurchaseOrdersParams) => ['purchase-orders', 'list', params] as const,
  detail: (id: string) => ['purchase-orders', 'detail', id] as const,
  payments: (id: string) => ['purchase-orders', 'payments', id] as const,
};

export function usePurchaseOrders(params: PurchaseOrdersParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getPurchaseOrdersApi(params),
    staleTime: 30_000,
  });
}

export function usePurchaseOrdersInfinite(params: Omit<PurchaseOrdersParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getPurchaseOrdersApi({ ...params, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 20 ? pages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getPurchaseOrderApi(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function usePurchasePayments(id: string) {
  return useQuery({
    queryKey: KEYS.payments(id),
    queryFn: () => getPurchasePaymentsApi(id),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) => createPurchaseOrderApi(payload),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: KEYS.all }); },
  });
}

export function useReceiveGoods() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReceiveGoodsPayload }) =>
      receiveGoodsApi(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useAllocateStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AllocateStockPayload }) =>
      allocateStockApi(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useRecordPurchasePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RecordPurchasePaymentPayload }) =>
      recordPurchasePaymentApi(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.payments(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
