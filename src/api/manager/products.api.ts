import { apiClient } from '../client';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  unit: string;
  sellingPrice: number;
  costPrice?: number;
  taxPercent?: number;
  weightKg?: number;
  currentStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsPage {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductPayload {
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  unit: string;
  sellingPrice: number;
  costPrice?: number;
  taxPercent?: number;
  weightKg?: number;
}

export type UpdateProductPayload = Partial<CreateProductPayload> & { isActive?: boolean };

export const getProductsApi = async (params: {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}): Promise<ProductsPage> => {
  const response = await apiClient.get<ProductsPage>('/products', { params });
  return response.data;
};

export const getProductByIdApi = async (id: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProductApi = async (payload: CreateProductPayload): Promise<Product> => {
  const response = await apiClient.post<Product>('/products', payload);
  return response.data;
};

export const updateProductApi = async (id: string, payload: UpdateProductPayload): Promise<Product> => {
  const response = await apiClient.put<Product>(`/products/${id}`, payload);
  return response.data;
};
