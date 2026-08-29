import { useEffect, useRef } from 'react';
import { Centrifuge } from 'centrifuge';
import { useQueryClient } from '@tanstack/react-query';
import { getCentrifugoTokenApi } from '../api/location.api';
import { useAuthStore } from '../store/auth.store';

export function useCentrifugo(): void {
  const queryClient = useQueryClient();
  const { userId, organizationId, locationId, role, token } = useAuthStore();
  const centrifugeRef = useRef<Centrifuge | null>(null);

  useEffect(() => {
    if (!token || !userId || !organizationId) return;

    const centrifugoUrl =
      process.env.EXPO_PUBLIC_CENTRIFUGO_URL ??
      'ws://localhost:8000/connection/websocket';

    const client = new Centrifuge(centrifugoUrl, {
      getToken: async () => {
        const tok = await getCentrifugoTokenApi();
        return tok;
      },
    });

    centrifugeRef.current = client;

    const userSub = client.newSubscription(`user_${userId}`);
    userSub.on('publication', (ctx) => {
      const event = ctx.data as { type?: string };
      if (event.type === 'trip:assigned') {
        void queryClient.invalidateQueries({ queryKey: ['trips', 'today'] });
      }
    });
    userSub.subscribe();

    const orgSub = client.newSubscription(`org_${organizationId}`);
    orgSub.subscribe();

    if (role === 'PICKER' && locationId) {
      const locationSub = client.newSubscription(`location_${locationId}`);
      locationSub.on('publication', (ctx) => {
        const event = ctx.data as { type?: string };
        if (event.type === 'order:new') {
          void queryClient.invalidateQueries({ queryKey: ['orders', 'queue'] });
        }
      });
      locationSub.subscribe();
    }

    client.connect();

    return () => {
      client.disconnect();
    };
  }, [token, userId, organizationId, locationId, role, queryClient]);
}
