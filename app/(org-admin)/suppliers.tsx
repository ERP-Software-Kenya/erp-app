import { useRouter } from 'expo-router';
import { SupplierListScreen } from '@/screens/manager/SupplierListScreen';

export default function OrgAdminSuppliers() {
  const router = useRouter();
  return (
    <SupplierListScreen
      onOpenSupplier={(id) => router.push(`/(org-admin)/supplier/${id}` as never)}
      onBack={() => router.back()}
    />
  );
}
