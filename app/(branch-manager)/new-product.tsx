import { useRouter } from 'expo-router';
import { NewProductScreen } from '@/screens/manager/NewProductScreen';

export default function BranchManagerNewProduct() {
  const router = useRouter();
  return (
    <NewProductScreen
      onBack={() => router.back()}
      onSuccess={(id) => router.replace(`/(branch-manager)/product/${id}` as never)}
    />
  );
}
