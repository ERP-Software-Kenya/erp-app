import React from 'react';
import { router } from 'expo-router';
import { SalesScreen } from '@/screens/manager/SalesScreen';

export default function BranchManagerSales(): React.ReactElement {
  return (
    <SalesScreen
      onOpenOrder={(id) => router.push(`/(branch-manager)/order/${id}` as never)}
      onNewOrder={() => router.push('/(branch-manager)/new-order' as never)}
      onOpenQuotation={(id) => router.push(`/(branch-manager)/quotation/${id}` as never)}
      onNewQuotation={() => router.push('/(branch-manager)/new-quotation' as never)}
      onOpenReturn={(id) => router.push(`/(branch-manager)/return/${id}` as never)}
      onNewReturn={() => router.push('/(branch-manager)/new-return' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
