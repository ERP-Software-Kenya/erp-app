import { useRouter } from 'expo-router';
import { MoreScreen } from '@/screens/manager/MoreScreen';

export default function BranchManagerMore() {
  const router = useRouter();
  return (
    <MoreScreen
      onOpenCustomers={() => router.push('/(branch-manager)/customers' as never)}
      onOpenSuppliers={() => router.push('/(branch-manager)/suppliers' as never)}
      onOpenProducts={() => router.push('/(branch-manager)/products' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
