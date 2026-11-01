import React from 'react';
import { router } from 'expo-router';
import { NewOrderScreen } from '@/screens/manager/NewOrderScreen';

export default function BranchManagerNewOrder(): React.ReactElement {
  return (
    <NewOrderScreen
      onBack={() => router.back()}
      onSuccess={(orderId) => router.replace(`/(branch-manager)/order/${orderId}` as never)}
    />
  );
}
