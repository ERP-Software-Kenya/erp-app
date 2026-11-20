import { useLocalSearchParams, useRouter } from 'expo-router';
import { NewReturnScreen } from '@/screens/manager/NewReturnScreen';

export default function BranchManagerNewReturn() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  return (
    <NewReturnScreen
      orderId={orderId}
      onBack={() => router.back()}
      onSuccess={(rid) => router.replace(`/(branch-manager)/return/${rid}` as never)}
    />
  );
}
