import { useQuery } from '@tanstack/react-query';
import { getLocationsApi } from '@/api/manager/locations.api';

export function useLocations() {
  return useQuery({
    queryKey: ['warehouse-locations'],
    queryFn: getLocationsApi,
    staleTime: 5 * 60_000,
  });
}
