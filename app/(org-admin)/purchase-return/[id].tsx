import { useLocalSearchParams, useRouter } from 'expo-router';
import { PurchaseReturnDetailScreen } from '@/screens/manager/PurchaseReturnDetailScreen';

export default function OrgAdminPurchaseReturnDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <PurchaseReturnDetailScreen
      id={id}
      onBack={() => router.back()}
    />
  );
}
