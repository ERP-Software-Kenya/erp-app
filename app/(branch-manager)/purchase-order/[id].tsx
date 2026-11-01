import { useLocalSearchParams, useRouter } from 'expo-router';
import { PurchaseOrderDetailScreen } from '@/screens/manager/PurchaseOrderDetailScreen';

export default function BranchManagerPurchaseOrderDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PurchaseOrderDetailScreen
      id={id}
      onBack={() => router.back()}
      onNewReturn={(poId) => router.push(`/(branch-manager)/new-purchase-return?poId=${poId}` as never)}
    />
  );
}
