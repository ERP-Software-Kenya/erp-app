import { useLocalSearchParams, useRouter } from 'expo-router';
import { CustomerDetailScreen } from '@/screens/manager/CustomerDetailScreen';

export default function OrgAdminCustomerDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <CustomerDetailScreen
      id={id}
      onBack={() => router.back()}
      onOpenOrder={(orderId) => router.push(`/(org-admin)/order/${orderId}` as never)}
    />
  );
}
