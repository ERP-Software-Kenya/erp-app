import { useRouter } from 'expo-router';
import { SupplierListScreen } from '@/screens/manager/SupplierListScreen';

export default function BranchManagerSuppliers() {
  const router = useRouter();
  return (
    <SupplierListScreen
      onOpenSupplier={(id) => router.push(`/(branch-manager)/supplier/${id}` as never)}
      onBack={() => router.back()}
    />
  );
}
