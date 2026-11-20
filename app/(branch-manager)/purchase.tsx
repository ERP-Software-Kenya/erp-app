import { useRouter } from 'expo-router';
import { PurchaseScreen } from '@/screens/manager/PurchaseScreen';

export default function BranchManagerPurchase() {
  const router = useRouter();
  return (
    <PurchaseScreen
      onOpenPO={(id) => router.push(`/(branch-manager)/purchase-order/${id}` as never)}
      onNewPO={() => router.push('/(branch-manager)/new-purchase-order' as never)}
      onOpenPurchaseReturn={(id) => router.push(`/(branch-manager)/purchase-return/${id}` as never)}
      onNewPurchaseReturn={() => router.push('/(branch-manager)/new-purchase-return' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
