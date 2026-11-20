import { useLocalSearchParams, useRouter } from 'expo-router';
import { NewPurchaseReturnScreen } from '@/screens/manager/NewPurchaseReturnScreen';

export default function OrgAdminNewPurchaseReturn() {
  const router = useRouter();
  const { poId } = useLocalSearchParams<{ poId?: string }>();
  return (
    <NewPurchaseReturnScreen
      poId={poId}
      onBack={() => router.back()}
      onSuccess={(rid) => router.replace(`/(org-admin)/purchase-return/${rid}` as never)}
    />
  );
}
