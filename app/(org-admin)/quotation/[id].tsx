import { useLocalSearchParams, useRouter } from 'expo-router';
import { QuotationDetailScreen } from '@/screens/manager/QuotationDetailScreen';

export default function OrgAdminQuotationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <QuotationDetailScreen
      id={id}
      onBack={() => router.back()}
      onOrderCreated={(orderId) => router.replace(`/(org-admin)/order/${orderId}` as never)}
    />
  );
}
