import { apiClient } from '../client';

export type QuotationStatus = 'draft' | 'sent' | 'converted' | 'cancelled';

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string | null;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  status: QuotationStatus;
  items: QuotationItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  validUntil?: string;
  notes?: string;
  createdAt: string;
}

export interface QuotationRow {
  id: string;
  quotationNumber: string;
  customerName: string;
  itemCount: number;
  grandTotal: number;
  status: QuotationStatus;
  validUntil?: string;
  createdAt: string;
}

export interface QuotationsParams {
  search?: string;
  status?: QuotationStatus | '';
  page?: number;
  perPage?: number;
}

export interface CreateQuotationPayload {
  customerId?: string;
  customerName?: string;
  validUntil?: string;
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

export async function getQuotationsApi(
  params: QuotationsParams = {},
): Promise<PaginatedResponse<QuotationRow>> {
  const res = await apiClient.get<PaginatedResponse<QuotationRow>>('/v1/quotations', {
    params: { ...params, perPage: params.perPage ?? 20 },
  });
  return res.data;
}

export async function getQuotationApi(id: string): Promise<Quotation> {
  const res = await apiClient.get<Quotation>(`/v1/quotations/${id}`);
  return res.data;
}

export async function createQuotationApi(payload: CreateQuotationPayload): Promise<Quotation> {
  const res = await apiClient.post<Quotation>('/v1/quotations', payload);
  return res.data;
}

export async function convertQuotationToOrderApi(id: string): Promise<{ orderId: string }> {
  const res = await apiClient.post<{ orderId: string }>(`/v1/quotations/${id}/convert-to-order`);
  return res.data;
}

export async function sendQuotationEmailApi(id: string): Promise<void> {
  await apiClient.post(`/v1/quotations/${id}/send-email`);
}
