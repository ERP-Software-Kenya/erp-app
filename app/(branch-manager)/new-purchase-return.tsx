import { useLocalSearchParams, useRouter } from 'expo-router';
import { NewPurchaseReturnScreen } from '@/screens/manager/NewPurchaseReturnScreen';

export default function BranchManagerNewPurchaseReturn() {
  const router = useRouter();
  const { poId } = useLocalSearchParams<{ poId?: string }>();
  return (
    <NewPurchaseReturnScreen
      poId={poId}
      onBack={() => router.back()}
      onSuccess={(rid) => router.replace(`/(branch-manager)/purchase-return/${rid}` as never)}
    />
  );
}
