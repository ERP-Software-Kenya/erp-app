import { useRouter } from 'expo-router';
import { ProductListScreen } from '@/screens/manager/ProductListScreen';

export default function BranchManagerProducts() {
  const router = useRouter();
  return (
    <ProductListScreen
      onBack={() => router.back()}
      onOpenProduct={(id) => router.push(`/(branch-manager)/product/${id}` as never)}
      onNewProduct={() => router.push('/(branch-manager)/new-product' as never)}
    />
  );
}
