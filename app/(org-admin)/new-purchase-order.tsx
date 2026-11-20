import { useRouter } from 'expo-router';
import { NewPurchaseOrderScreen } from '@/screens/manager/NewPurchaseOrderScreen';

export default function OrgAdminNewPurchaseOrder() {
  const router = useRouter();
  return (
    <NewPurchaseOrderScreen
      onBack={() => router.back()}
      onSuccess={(poId) => router.replace(`/(org-admin)/purchase-order/${poId}` as never)}
    />
  );
}
