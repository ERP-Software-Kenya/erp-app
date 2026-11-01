import { apiClient } from '../client';

export interface WarehouseLocation {
  id: string;
  name: string;
  code: string;
  warehouseName?: string;
  isDefault: boolean;
}

export async function getLocationsApi(): Promise<WarehouseLocation[]> {
  const res = await apiClient.get<WarehouseLocation[]>('/v1/warehouse-locations');
  return res.data;
}
