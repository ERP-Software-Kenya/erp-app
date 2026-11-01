import { useLocalSearchParams, useRouter } from 'expo-router';
import { CustomerDetailScreen } from '@/screens/manager/CustomerDetailScreen';

export default function BranchManagerCustomerDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <CustomerDetailScreen
      id={id}
      onBack={() => router.back()}
      onOpenOrder={(orderId) => router.push(`/(branch-manager)/order/${orderId}` as never)}
    />
  );
}
