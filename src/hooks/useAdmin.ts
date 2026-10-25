import { useQuery } from '@tanstack/react-query';
import {
  getOrgSummaryApi,
  getDriverLocationsApi,
  getStockAlertsApi,
  getBranchSummaryApi,
  getPlatformSummaryApi,
} from '../api/admin.api';

export function useOrgSummary() {
  return useQuery({ queryKey: ['org-summary'], queryFn: getOrgSummaryApi, refetchInterval: 30_000 });
}

export function useDriverLocations() {
  return useQuery({ queryKey: ['driver-locations'], queryFn: getDriverLocationsApi, refetchInterval: 15_000 });
}

export function useStockAlerts() {
  return useQuery({ queryKey: ['stock-alerts'], queryFn: getStockAlertsApi, refetchInterval: 60_000 });
}

export function useBranchSummary() {
  return useQuery({ queryKey: ['branch-summary'], queryFn: getBranchSummaryApi, refetchInterval: 30_000 });
}

export function useBranchStockAlerts() {
  return useQuery({ queryKey: ['branch-stock-alerts'], queryFn: getStockAlertsApi, refetchInterval: 60_000 });
}

export function usePlatformSummary() {
  return useQuery({ queryKey: ['platform-summary'], queryFn: getPlatformSummaryApi, refetchInterval: 30_000 });
}
