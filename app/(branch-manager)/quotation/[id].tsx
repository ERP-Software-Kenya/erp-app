import { useLocalSearchParams, useRouter } from 'expo-router';
import { QuotationDetailScreen } from '@/screens/manager/QuotationDetailScreen';

export default function BranchManagerQuotationDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <QuotationDetailScreen
      id={id}
      onBack={() => router.back()}
      onOrderCreated={(orderId) => router.replace(`/(branch-manager)/order/${orderId}` as never)}
    />
  );
}
