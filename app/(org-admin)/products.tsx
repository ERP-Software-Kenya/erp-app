import { useRouter } from 'expo-router';
import { ProductListScreen } from '@/screens/manager/ProductListScreen';

export default function OrgAdminProducts() {
  const router = useRouter();
  return (
    <ProductListScreen
      onBack={() => router.back()}
      onOpenProduct={(id) => router.push(`/(org-admin)/product/${id}` as never)}
      onNewProduct={() => router.push('/(org-admin)/new-product' as never)}
    />
  );
}
