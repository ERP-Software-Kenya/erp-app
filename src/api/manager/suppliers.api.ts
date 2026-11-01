import { apiClient } from '../client';

export interface SupplierPOSummary {
  id: string;
  poNumber: string;
  grandTotal: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  outstandingPayable: number;
  createdAt: string;
  recentPOs?: SupplierPOSummary[];
}

export interface SuppliersParams {
  search?: string;
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface CreateSupplierPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export async function getSuppliersApi(
  params: SuppliersParams = {},
): Promise<PaginatedResponse<Supplier>> {
  const res = await apiClient.get<PaginatedResponse<Supplier>>('/v1/suppliers', {
    params: { ...params, perPage: params.perPage ?? 30 },
  });
  return res.data;
}

export async function getSupplierApi(id: string): Promise<Supplier> {
  const res = await apiClient.get<Supplier>(`/v1/suppliers/${id}`);
  return res.data;
}

export async function createSupplierApi(payload: CreateSupplierPayload): Promise<Supplier> {
  const res = await apiClient.post<Supplier>('/v1/suppliers', payload);
  return res.data;
}
