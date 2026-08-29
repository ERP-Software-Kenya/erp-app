import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTodayTripsApi,
  getTripDetailApi,
  updateTripStatusApi,
  initiateDeliveryApi,
  confirmDeliveryApi,
  type TripStatus,
} from '../api/trips.api';

export function useTodayTrips() {
  return useQuery({
    queryKey: ['trips', 'today'],
    queryFn: getTodayTripsApi,
    staleTime: 30_000,
  });
}

export function useTripDetail(tripId: string) {
  return useQuery({
    queryKey: ['trips', 'detail', tripId],
    queryFn: () => getTripDetailApi(tripId),
    enabled: Boolean(tripId),
  });
}

export function useUpdateTripStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, status }: { tripId: string; status: TripStatus }) =>
      updateTripStatusApi(tripId, status),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['trips', 'today'] });
      void queryClient.invalidateQueries({
        queryKey: ['trips', 'detail', variables.tripId],
      });
    },
  });
}

export function useInitiateDelivery() {
  return useMutation({
    mutationFn: ({
      tripId,
      stopId,
    }: {
      tripId: string;
      stopId: string;
    }) => initiateDeliveryApi(tripId, stopId),
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tripId,
      stopId,
      otp,
    }: {
      tripId: string;
      stopId: string;
      otp: string;
    }) => confirmDeliveryApi(tripId, stopId, otp),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['trips', 'detail', variables.tripId],
      });
    },
  });
}
