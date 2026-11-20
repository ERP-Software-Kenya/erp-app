import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { OrderDetailScreen } from '@/screens/manager/OrderDetailScreen';

export default function OrgAdminOrderDetail(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <OrderDetailScreen
      id={id}
      onBack={() => router.back()}
      onNewReturn={(orderId) => router.push(`/(org-admin)/new-return?orderId=${orderId}` as never)}
    />
  );
}
