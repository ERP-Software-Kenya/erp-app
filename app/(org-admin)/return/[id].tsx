import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReturnDetailScreen } from '@/screens/manager/ReturnDetailScreen';

export default function OrgAdminReturnDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ReturnDetailScreen
      id={id}
      onBack={() => router.back()}
    />
  );
}
