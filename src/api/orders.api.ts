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

export async function getOrderQueueApi(locationIds: string[]): Promise<Order[]> {
  const queues = await Promise.all(locationIds.map(async (locationId) => {
    const response = await apiClient.get<Array<{
      id: string;
      orderNumber: string;
      status: string;
      createdAt: string;
    }>>('/v1/warehouse/orders/queue', {
      params: { locationId },
    });
    return response.data.map((order): Order => ({
      ...order,
      customerName: '',
      urgency: 'normal',
      binLocations: [],
      itemCount: 0,
    }));
  }));
  return [...new Map(queues.flat().map((order) => [order.id, order])).values()];
}

export async function getOrderDetailApi(orderId: string): Promise<Order> {
  const response = await apiClient.get<{
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    items?: Array<{
      id: string;
      productName?: string;
      binLocation?: string;
      quantity: number;
    }>;
  }>(`/v1/warehouse/orders/${orderId}`);
  return {
    ...response.data,
    customerName: '',
    urgency: 'normal',
    binLocations: [...new Set((response.data.items ?? []).map((item) => item.binLocation ?? '').filter(Boolean))],
    itemCount: response.data.items?.length ?? 0,
    items: response.data.items?.map((item) => ({
      orderItemId: item.id,
      productName: item.productName ?? '',
      binLocation: item.binLocation ?? '',
      orderedQty: Number(item.quantity),
    })),
  };
}

export async function claimOrderApi(orderId: string): Promise<void> {
  await apiClient.post(`/v1/warehouse/orders/${orderId}/claim`);
}

export async function packOrderApi(
  orderId: string,
  items: PackItemPayload[],
): Promise<void> {
  await apiClient.post(`/v1/warehouse/orders/${orderId}/pack`, { items });
}
