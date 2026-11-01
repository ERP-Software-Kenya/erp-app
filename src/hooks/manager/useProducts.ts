import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProductsApi,
  getProductByIdApi,
  createProductApi,
  updateProductApi,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '@/api/manager/products.api';

const LIMIT = 20;

export function useProductsInfinite(search: string) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', search],
    queryFn: ({ pageParam = 1 }) =>
      getProductsApi({ search: search || undefined, page: pageParam as number, limit: LIMIT }),
    getNextPageParam: (last) =>
      last.data.length === LIMIT ? last.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProductByIdApi(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProductApi(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => updateProductApi(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products', id] });
      void qc.invalidateQueries({ queryKey: ['products', 'infinite'] });
    },
  });
}
