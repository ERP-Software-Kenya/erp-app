import { apiClient } from '../client';

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  grandTotal: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  creditLimit: number;
  outstandingBalance: number;
  createdAt: string;
  recentOrders?: CustomerOrderSummary[];
}

export interface CustomersParams {
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

export interface CreateCustomerPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  creditLimit?: number;
}

export async function getCustomersApi(
  params: CustomersParams = {},
): Promise<PaginatedResponse<Customer>> {
  const res = await apiClient.get<PaginatedResponse<Customer>>('/v1/customers', {
    params: { ...params, perPage: params.perPage ?? 30 },
  });
  return res.data;
}

export async function getCustomerApi(id: string): Promise<Customer> {
  const res = await apiClient.get<Customer>(`/v1/customers/${id}`);
  return res.data;
}

export async function createCustomerApi(payload: CreateCustomerPayload): Promise<Customer> {
  const res = await apiClient.post<Customer>('/v1/customers', payload);
  return res.data;
}
