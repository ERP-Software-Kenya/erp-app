import { useRouter } from 'expo-router';
import { CustomerListScreen } from '@/screens/manager/CustomerListScreen';

export default function OrgAdminCustomers() {
  const router = useRouter();
  return (
    <CustomerListScreen
      onOpenCustomer={(id) => router.push(`/(org-admin)/customer/${id}` as never)}
      onBack={() => router.back()}
    />
  );
}
