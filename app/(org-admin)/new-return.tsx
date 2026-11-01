import { useLocalSearchParams, useRouter } from 'expo-router';
import { NewReturnScreen } from '@/screens/manager/NewReturnScreen';

export default function OrgAdminNewReturn() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  return (
    <NewReturnScreen
      orderId={orderId}
      onBack={() => router.back()}
      onSuccess={(rid) => router.replace(`/(org-admin)/return/${rid}` as never)}
    />
  );
}
