import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getCustomersApi,
  getCustomerApi,
  createCustomerApi,
  type CustomersParams,
  type CreateCustomerPayload,
} from '@/api/manager/customers.api';

const KEYS = {
  all: ['customers'] as const,
  list: (params: CustomersParams) => ['customers', 'list', params] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
};

export function useCustomers(params: CustomersParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => getCustomersApi(params),
    staleTime: 60_000,
  });
}

export function useCustomersInfinite(params: Omit<CustomersParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...KEYS.all, 'infinite', params] as const,
    queryFn: ({ pageParam }) => getCustomersApi({ ...params, page: pageParam as number, perPage: 30 }),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      last.data.length === 30 ? pages.length + 1 : undefined,
    staleTime: 60_000,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getCustomerApi(id),
    enabled: Boolean(id),
    staleTime: 120_000,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomerApi(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
