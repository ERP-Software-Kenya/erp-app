import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getInventoryApi,
  getInventoryValuationApi,
  getLowStockApi,
  getInventoryItemApi,
  updateInventoryItemApi,
  getStockMovementsApi,
  getStockTransfersApi,
  createStockTransferApi,
  completeStockTransferApi,
  cancelStockTransferApi,
  type InventoryParams,
  type CreateStockTransferPayload,
} from '@/api/manager/inventory.api';

const KEYS = {
  all: ['inventory'] as const,
  list: (params: InventoryParams) => ['inventory', 'list', params] as const,
  detail: (id: string) => ['inventory', 'detail', id] as const,
  valuation: ['inventory', 'valuation'] as const,
  lowStock: ['inventory', 'low-stock'] as const,
  movements: (id: string) => ['inventory', 'movements', id] as const,
  transfers: ['stock-transfers'] as const,
};

export function useInventory(params: InventoryParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getInventoryApi(params),
    staleTime: 30_000,
  });
}

export function useInventoryInfinite(params: Omit<InventoryParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getInventoryApi({ ...params, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 20 ? pages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function useInventoryValuation() {
  return useQuery({
    queryKey: KEYS.valuation,
    queryFn: getInventoryValuationApi,
    staleTime: 60_000,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: KEYS.lowStock,
    queryFn: getLowStockApi,
    staleTime: 60_000,
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getInventoryItemApi(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useStockMovements(inventoryId: string) {
  return useQuery({
    queryKey: KEYS.movements(inventoryId),
    queryFn: () => getStockMovementsApi(inventoryId),
    enabled: Boolean(inventoryId),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { reorderLevel?: number; maxStock?: number } }) =>
      updateInventoryItemApi(id, payload),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: KEYS.detail(id) });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useStockTransfers(params: { search?: string; status?: string; page?: number } = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.transfers, params] as const,
    queryFn: ({ pageParam }) => getStockTransfersApi({ ...params, page: pageParam as number, perPage: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 20 ? pages.length + 1 : undefined,
    staleTime: 30_000,
  });
}

export function useCreateStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStockTransferPayload) => createStockTransferApi(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.transfers });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useCompleteStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeStockTransferApi(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.transfers });
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useCancelStockTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelStockTransferApi(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: KEYS.transfers }); },
  });
}
