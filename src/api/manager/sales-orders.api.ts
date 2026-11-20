import { apiClient } from '../client';

export type SaleOrderStatus = 'pending' | 'paid' | 'partial' | 'cancelled';

export interface SaleOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  lineTotal: number;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerName: string;
  customerPhone?: string;
  locationId: string;
  locationName: string;
  status: SaleOrderStatus;
  items: SaleOrderItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  outstanding: number;
  notes?: string;
  createdAt: string;
}

export interface SaleOrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  grandTotal: number;
  amountPaid: number;
  outstanding: number;
  status: SaleOrderStatus;
  createdAt: string;
}

export interface SaleOrdersParams {
  search?: string;
  status?: SaleOrderStatus | '';
  page?: number;
  perPage?: number;
}

export interface CreateSaleOrderPayload {
  customerId?: string;
  customerName?: string;
  isWalkIn?: boolean;
  locationId: string;
  notes?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxPercent?: number;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export async function getSaleOrdersApi(
  params: SaleOrdersParams = {},
): Promise<PaginatedResponse<SaleOrderRow>> {
  const res = await apiClient.get<PaginatedResponse<SaleOrderRow>>('/v1/orders', {
    params: { ...params, perPage: params.perPage ?? 20 },
  });
  return res.data;
}

export async function getSaleOrderApi(id: string): Promise<SaleOrder> {
  const res = await apiClient.get<SaleOrder>(`/v1/orders/${id}`);
  return res.data;
}

export async function createSaleOrderApi(payload: CreateSaleOrderPayload): Promise<SaleOrder> {
  const res = await apiClient.post<SaleOrder>('/v1/orders', payload);
  return res.data;
}
