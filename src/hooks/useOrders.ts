import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrderQueueApi,
  getOrderDetailApi,
  claimOrderApi,
  packOrderApi,
  type PackItemPayload,
} from '../api/orders.api';
import { useAuthStore } from '../store/auth.store';

export function useOrderQueue() {
  const locationIds = useAuthStore((state) => state.locationIds);
  return useQuery({
    queryKey: ['orders', 'queue', locationIds],
    queryFn: () => getOrderQueueApi(locationIds),
    enabled: locationIds.length > 0,
    staleTime: 30_000,
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['orders', 'detail', orderId],
    queryFn: () => getOrderDetailApi(orderId),
    enabled: Boolean(orderId),
  });
}

export function useClaimOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => claimOrderApi(orderId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', 'queue'] });
    },
  });
}

export function usePackOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      items,
    }: {
      orderId: string;
      items: PackItemPayload[];
    }) => packOrderApi(orderId, items),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['orders', 'detail', variables.orderId],
      });
      void queryClient.invalidateQueries({ queryKey: ['orders', 'queue'] });
    },
  });
}
