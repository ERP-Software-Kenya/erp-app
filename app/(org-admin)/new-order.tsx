import React from 'react';
import { router } from 'expo-router';
import { NewOrderScreen } from '@/screens/manager/NewOrderScreen';

export default function OrgAdminNewOrder(): React.ReactElement {
  return (
    <NewOrderScreen
      onBack={() => router.back()}
      onSuccess={(orderId) => router.replace(`/(org-admin)/order/${orderId}` as never)}
    />
  );
}
