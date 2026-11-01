import { apiClient } from '../client';

export type PaymentMethod = 'cash' | 'bank' | 'upi' | 'cheque';

export interface RecordPaymentPayload {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  date?: string;
  note?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
  createdAt: string;
}

export async function recordSalePaymentApi(payload: RecordPaymentPayload): Promise<Payment> {
  const res = await apiClient.post<Payment>('/v1/payment-transactions', payload);
  return res.data;
}
