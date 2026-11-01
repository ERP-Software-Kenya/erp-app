import { apiClient } from '../client';

export type PurchaseReturnStatus = 'draft' | 'finalized' | 'cancelled';

export interface PurchaseReturnItem {
  id: string;
  purchaseOrderItemId: string;
  productName: string;
  quantityReturned: number;
  unitCost: number;
  lineRefund: number;
}

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierName: string;
  status: PurchaseReturnStatus;
  items: PurchaseReturnItem[];
  totalRefund: number;
  reason?: string;
  createdAt: string;
}

export interface PurchaseReturnRow {
  id: string;
  returnNumber: string;
  poNumber: string;
  supplierName: string;
  itemCount: number;
  totalRefund: number;
  status: PurchaseReturnStatus;
  createdAt: string;
}

export interface PurchaseReturnsParams {
  search?: string;
  status?: PurchaseReturnStatus | '';
  page?: number;
  perPage?: number;
}

export interface CreatePurchaseReturnPayload {
  purchaseOrderId: string;
  reason?: string;
  items: { purchaseOrderItemId: string; quantityReturned: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export async function getPurchaseReturnsApi(
  params: PurchaseReturnsParams = {},
): Promise<PaginatedResponse<PurchaseReturnRow>> {
  const res = await apiClient.get<PaginatedResponse<PurchaseReturnRow>>('/v1/purchase-returns', {
    params: { ...params, perPage: params.perPage ?? 20 },
  });
  return res.data;
}

export async function getPurchaseReturnApi(id: string): Promise<PurchaseReturn> {
  const res = await apiClient.get<PurchaseReturn>(`/v1/purchase-returns/${id}`);
  return res.data;
}

export async function createPurchaseReturnApi(payload: CreatePurchaseReturnPayload): Promise<PurchaseReturn> {
  const res = await apiClient.post<PurchaseReturn>('/v1/purchase-returns', payload);
  return res.data;
}

export async function finalizePurchaseReturnApi(id: string): Promise<PurchaseReturn> {
  const res = await apiClient.post<PurchaseReturn>(`/v1/purchase-returns/${id}/finalize`);
  return res.data;
}

export async function cancelPurchaseReturnApi(id: string): Promise<PurchaseReturn> {
  const res = await apiClient.post<PurchaseReturn>(`/v1/purchase-returns/${id}/cancel`);
  return res.data;
}
