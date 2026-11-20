import { useRouter } from 'expo-router';
import { CustomerListScreen } from '@/screens/manager/CustomerListScreen';

export default function BranchManagerCustomers() {
  const router = useRouter();
  return (
    <CustomerListScreen
      onOpenCustomer={(id) => router.push(`/(branch-manager)/customer/${id}` as never)}
      onBack={() => router.back()}
    />
  );
}
