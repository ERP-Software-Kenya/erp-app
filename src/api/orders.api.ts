import { apiClient } from './client';

export type OrderUrgency = 'normal' | 'urgent';

export interface OrderItem {
  orderItemId: string;
  productName: string;
  binLocation: string;
  orderedQty: number;
  packedQty?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  urgency: OrderUrgency;
  binLocations: string[];
  itemCount: number;
  items?: OrderItem[];
  status: string;
  createdAt: string;
}

export interface PackItemPayload {
  orderItemId: string;
  packedQty: number;
}

export async function getOrderQueueApi(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/v1/orders/queue');
  return response.data;
}

export async function getOrderDetailApi(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/v1/orders/${orderId}`);
  return response.data;
}

export async function claimOrderApi(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(`/v1/orders/${orderId}/claim`);
  return response.data;
}

export async function packOrderApi(
  orderId: string,
  items: PackItemPayload[],
): Promise<void> {
  await apiClient.post(`/v1/orders/${orderId}/pack`, { items });
}
