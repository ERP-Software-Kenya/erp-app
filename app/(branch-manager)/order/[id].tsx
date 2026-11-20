import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { OrderDetailScreen } from '@/screens/manager/OrderDetailScreen';

export default function BranchManagerOrderDetail(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <OrderDetailScreen
      id={id}
      onBack={() => router.back()}
      onNewReturn={(orderId) => router.push(`/(branch-manager)/new-return?orderId=${orderId}` as never)}
    />
  );
}
