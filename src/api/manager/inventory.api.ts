import { apiClient } from '../client';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  locationId: string;
  locationName: string;
  onHandQty: number;
  availableQty: number;
  reservedQty: number;
  reorderLevel: number;
  maxStock: number;
  status: StockStatus;
  unitCost: number;
  stockValue: number;
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  referenceType: string;
  referenceNumber: string;
  note?: string;
  createdAt: string;
}

export interface InventoryValuation {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryParams {
  search?: string;
  locationId?: string;
  status?: StockStatus | '';
  page?: number;
  perPage?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;
  status: 'pending' | 'completed' | 'cancelled';
  itemCount: number;
  createdAt: string;
}

export interface CreateStockTransferPayload {
  fromLocationId: string;
  toLocationId: string;
  items: { inventoryId: string; quantity: number }[];
}

export async function getInventoryApi(
  params: InventoryParams = {},
): Promise<PaginatedResponse<InventoryItem>> {
  const res = await apiClient.get<PaginatedResponse<InventoryItem>>('/v1/inventory', {
    params: { ...params, perPage: params.perPage ?? 20 },
  });
  return res.data;
}

export async function getInventoryValuationApi(): Promise<InventoryValuation> {
  const res = await apiClient.get<InventoryValuation>('/v1/inventory/valuation');
  return res.data;
}

export async function getLowStockApi(): Promise<InventoryItem[]> {
  const res = await apiClient.get<InventoryItem[]>('/v1/inventory/low-stock');
  return res.data;
}

export async function getInventoryItemApi(id: string): Promise<InventoryItem> {
  const res = await apiClient.get<InventoryItem>(`/v1/inventory/${id}`);
  return res.data;
}

export async function updateInventoryItemApi(
  id: string,
  payload: { reorderLevel?: number; maxStock?: number },
): Promise<InventoryItem> {
  const res = await apiClient.put<InventoryItem>(`/v1/inventory/${id}`, payload);
  return res.data;
}

export async function getStockMovementsApi(inventoryId: string): Promise<StockMovement[]> {
  const res = await apiClient.get<StockMovement[]>(`/v1/stock-movements/by-inventory/${inventoryId}`);
  return res.data;
}

export async function getStockTransfersApi(
  params: { search?: string; status?: string; page?: number; perPage?: number } = {},
): Promise<PaginatedResponse<StockTransfer>> {
  const res = await apiClient.get<PaginatedResponse<StockTransfer>>('/v1/stock-transfers', {
    params: { ...params, perPage: params.perPage ?? 20 },
  });
  return res.data;
}

export async function createStockTransferApi(payload: CreateStockTransferPayload): Promise<StockTransfer> {
  const res = await apiClient.post<StockTransfer>('/v1/stock-transfers', payload);
  return res.data;
}

export async function completeStockTransferApi(id: string): Promise<StockTransfer> {
  const res = await apiClient.post<StockTransfer>(`/v1/stock-transfers/${id}/complete`);
  return res.data;
}

export async function cancelStockTransferApi(id: string): Promise<StockTransfer> {
  const res = await apiClient.post<StockTransfer>(`/v1/stock-transfers/${id}/cancel`);
  return res.data;
}
