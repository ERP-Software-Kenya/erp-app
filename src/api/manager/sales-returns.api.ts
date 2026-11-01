import { apiClient } from '../client';

export type SaleReturnStatus = 'draft' | 'finalized' | 'cancelled';

export interface SaleReturnItem {
  id: string;
  orderItemId: string;
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityReturnable: number;
  quantityReturned: number;
  unitPrice: number;
  lineRefund: number;
}

export interface SaleReturn {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  status: SaleReturnStatus;
  items: SaleReturnItem[];
  totalRefund: number;
  reason?: string;
  createdAt: string;
}

export interface SaleReturnRow {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  totalRefund: number;
  status: SaleReturnStatus;
  createdAt: string;
}

export interface SaleReturnsParams {
  search?: string;
  status?: SaleReturnStatus | '';
  page?: number;
  perPage?: number;
}

export interface CreateSaleReturnPayload {
  orderId: string;
  reason?: string;
  items: { orderItemId: string; quantityReturned: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export async function getSaleReturnsApi(
  params: SaleReturnsParams = {},
): Promise<PaginatedResponse<SaleReturnRow>> {
  const res = await apiClient.get<PaginatedResponse<SaleReturnRow>>('/v1/sales-returns', {
    params: { ...params, perPage: params.perPage ?? 20 },
  });
  return res.data;
}

export async function getSaleReturnApi(id: string): Promise<SaleReturn> {
  const res = await apiClient.get<SaleReturn>(`/v1/sales-returns/${id}`);
  return res.data;
}

export async function createSaleReturnApi(payload: CreateSaleReturnPayload): Promise<SaleReturn> {
  const res = await apiClient.post<SaleReturn>('/v1/sales-returns', payload);
  return res.data;
}

export async function finalizeSaleReturnApi(id: string): Promise<SaleReturn> {
  const res = await apiClient.post<SaleReturn>(`/v1/sales-returns/${id}/finalize`);
  return res.data;
}

export async function cancelSaleReturnApi(id: string): Promise<SaleReturn> {
  const res = await apiClient.post<SaleReturn>(`/v1/sales-returns/${id}/cancel`);
  return res.data;
}
