import { apiClient } from '../client';

export type PurchaseOrderStatus = 'draft' | 'ordered' | 'partial' | 'received' | 'paid' | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  quantityReceived?: number;
  unitCost: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  outstanding: number;
  expectedDelivery?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderRow {
  id: string;
  poNumber: string;
  supplierName: string;
  itemCount: number;
  grandTotal: number;
  amountPaid: number;
  outstanding: number;
  status: PurchaseOrderStatus;
  expectedDelivery?: string;
  createdAt: string;
}

export interface PurchaseOrdersParams {
  search?: string;
  status?: PurchaseOrderStatus | '';
  page?: number;
  perPage?: number;
}

export interface CreatePurchaseOrderPayload {
  supplierId?: string;
  supplierName?: string;
  expectedDelivery?: string;
  notes?: string;
  items: { productId: string; quantity: number; unitCost: number; taxPercent?: number }[];
}

export interface ReceiveGoodsPayload {
  items: { orderItemId: string; quantityReceived: number }[];
  deliveryNote?: string;
}

export interface AllocateStockPayload {
  locationId: string;
  items: { purchaseOrderItemId: string; quantity: number }[];
  notes?: string;
}

export interface RecordPurchasePaymentPayload {
  amount: number;
  paymentMethod: 'cash' | 'bank' | 'upi' | 'cheque';
  note?: string;
}

export interface PurchasePayment {
  id: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  note?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export async function getPurchaseOrdersApi(
  params: PurchaseOrdersParams = {},
): Promise<PaginatedResponse<PurchaseOrderRow>> {
  const res = await apiClient.get<PaginatedResponse<PurchaseOrderRow>>('/v1/purchase-orders', {
    params: { ...params, perPage: params.perPage ?? 20 },
  });
  return res.data;
}

export async function getPurchaseOrderApi(id: string): Promise<PurchaseOrder> {
  const res = await apiClient.get<PurchaseOrder>(`/v1/purchase-orders/${id}`);
  return res.data;
}

export async function createPurchaseOrderApi(payload: CreatePurchaseOrderPayload): Promise<PurchaseOrder> {
  const res = await apiClient.post<PurchaseOrder>('/v1/purchase-orders', payload);
  return res.data;
}

export async function receiveGoodsApi(id: string, payload: ReceiveGoodsPayload): Promise<PurchaseOrder> {
  const res = await apiClient.post<PurchaseOrder>(`/v1/purchase-orders/${id}/receive`, payload);
  return res.data;
}

export async function allocateStockApi(id: string, payload: AllocateStockPayload): Promise<PurchaseOrder> {
  const res = await apiClient.post<PurchaseOrder>(`/v1/purchase-orders/${id}/allocate`, payload);
  return res.data;
}

export async function recordPurchasePaymentApi(
  id: string,
  payload: RecordPurchasePaymentPayload,
): Promise<PurchasePayment> {
  const res = await apiClient.post<PurchasePayment>(`/v1/purchase-orders/${id}/payments`, payload);
  return res.data;
}

export async function getPurchasePaymentsApi(id: string): Promise<PurchasePayment[]> {
  const res = await apiClient.get<PurchasePayment[]>(`/v1/purchase-orders/${id}/payments`);
  return res.data;
}
