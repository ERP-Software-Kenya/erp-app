import { apiClient } from './client';

export interface OrgSummary {
  revenueToday: number;
  ordersToday: number;
  pendingOrders: number;
  lowStockCount: number;
  activeDrivers: number;
  deliveredToday: number;
}

export interface DriverLocation {
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'idle';
  currentStop?: string;
  stopsTotal?: number;
  stopsDone?: number;
}

export interface StockAlert {
  id: string;
  productName: string;
  sku: string;
  bin: string;
  warehouseName: string;
  currentStock: number;
  reorderLevel: number;
  isOutOfStock: boolean;
}

export interface BranchSummary {
  revenueToday: number;
  ordersToday: number;
  packedReady: number;
  lowStockCount: number;
}

export interface PlatformSummary {
  totalOrgs: number;
  totalOrdersToday: number;
  totalRevenue: number;
  totalActiveDrivers: number;
  deliveryRate: number;
  totalActiveUsers: number;
  totalStockAlerts: number;
}

export async function getOrgSummaryApi(): Promise<OrgSummary> {
  const res = await apiClient.get<OrgSummary>('/v1/analytics/org-summary');
  return res.data;
}

export async function getDriverLocationsApi(): Promise<DriverLocation[]> {
  const res = await apiClient.get<DriverLocation[]>('/v1/field-ops/drivers/locations');
  return res.data;
}

export async function getStockAlertsApi(): Promise<StockAlert[]> {
  const res = await apiClient.get<StockAlert[]>('/v1/inventory/alerts');
  return res.data;
}

export async function getBranchSummaryApi(): Promise<BranchSummary> {
  const res = await apiClient.get<BranchSummary>('/v1/analytics/branch-summary');
  return res.data;
}

export async function getPlatformSummaryApi(): Promise<PlatformSummary> {
  const res = await apiClient.get<PlatformSummary>('/v1/analytics/platform-summary');
  return res.data;
}
