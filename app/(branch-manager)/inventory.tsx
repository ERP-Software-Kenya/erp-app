import { useRouter } from 'expo-router';
import { InventoryScreen } from '@/screens/manager/InventoryScreen';

export default function BranchManagerInventory() {
  const router = useRouter();
  return (
    <InventoryScreen
      onOpenInventoryItem={(id) => router.push(`/(branch-manager)/inventory-item/${id}` as never)}
      onOpenTransfer={(id) => router.push(`/(branch-manager)/stock-transfer/${id}` as never)}
      onNewTransfer={() => router.push('/(branch-manager)/new-stock-transfer' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
