import { useLocalSearchParams, useRouter } from 'expo-router';
import { SupplierDetailScreen } from '@/screens/manager/SupplierDetailScreen';

export default function OrgAdminSupplierDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SupplierDetailScreen
      id={id}
      onBack={() => router.back()}
      onOpenPO={(poId) => router.push(`/(org-admin)/purchase-order/${poId}` as never)}
    />
  );
}
