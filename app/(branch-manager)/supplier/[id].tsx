import { useLocalSearchParams, useRouter } from 'expo-router';
import { SupplierDetailScreen } from '@/screens/manager/SupplierDetailScreen';

export default function BranchManagerSupplierDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SupplierDetailScreen
      id={id}
      onBack={() => router.back()}
      onOpenPO={(poId) => router.push(`/(branch-manager)/purchase-order/${poId}` as never)}
    />
  );
}
