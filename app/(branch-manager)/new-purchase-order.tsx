import { useRouter } from 'expo-router';
import { NewPurchaseOrderScreen } from '@/screens/manager/NewPurchaseOrderScreen';

export default function BranchManagerNewPurchaseOrder() {
  const router = useRouter();
  return (
    <NewPurchaseOrderScreen
      onBack={() => router.back()}
      onSuccess={(poId) => router.replace(`/(branch-manager)/purchase-order/${poId}` as never)}
    />
  );
}
