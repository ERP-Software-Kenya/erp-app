import { useLocalSearchParams, useRouter } from 'expo-router';
import { ProductDetailScreen } from '@/screens/manager/ProductDetailScreen';

export default function BranchManagerProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <ProductDetailScreen id={id!} onBack={() => router.back()} />;
}
