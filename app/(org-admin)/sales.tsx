import React from 'react';
import { router } from 'expo-router';
import { SalesScreen } from '@/screens/manager/SalesScreen';

export default function OrgAdminSales(): React.ReactElement {
  return (
    <SalesScreen
      onOpenOrder={(id) => router.push(`/(org-admin)/order/${id}` as never)}
      onNewOrder={() => router.push('/(org-admin)/new-order' as never)}
      onOpenQuotation={(id) => router.push(`/(org-admin)/quotation/${id}` as never)}
      onNewQuotation={() => router.push('/(org-admin)/new-quotation' as never)}
      onOpenReturn={(id) => router.push(`/(org-admin)/return/${id}` as never)}
      onNewReturn={() => router.push('/(org-admin)/new-return' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
