import { useRouter } from 'expo-router';
import { PurchaseScreen } from '@/screens/manager/PurchaseScreen';

export default function OrgAdminPurchase() {
  const router = useRouter();
  return (
    <PurchaseScreen
      onOpenPO={(id) => router.push(`/(org-admin)/purchase-order/${id}` as never)}
      onNewPO={() => router.push('/(org-admin)/new-purchase-order' as never)}
      onOpenPurchaseReturn={(id) => router.push(`/(org-admin)/purchase-return/${id}` as never)}
      onNewPurchaseReturn={() => router.push('/(org-admin)/new-purchase-return' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
