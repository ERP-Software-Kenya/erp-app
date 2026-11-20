import { useRouter } from 'expo-router';
import { InventoryScreen } from '@/screens/manager/InventoryScreen';

export default function OrgAdminInventory() {
  const router = useRouter();
  return (
    <InventoryScreen
      onOpenInventoryItem={(id) => router.push(`/(org-admin)/inventory-item/${id}` as never)}
      onOpenTransfer={(id) => router.push(`/(org-admin)/stock-transfer/${id}` as never)}
      onNewTransfer={() => router.push('/(org-admin)/new-stock-transfer' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
