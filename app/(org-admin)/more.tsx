import { useRouter } from 'expo-router';
import { MoreScreen } from '@/screens/manager/MoreScreen';

export default function OrgAdminMore() {
  const router = useRouter();
  return (
    <MoreScreen
      onOpenCustomers={() => router.push('/(org-admin)/customers' as never)}
      onOpenSuppliers={() => router.push('/(org-admin)/suppliers' as never)}
      onOpenProducts={() => router.push('/(org-admin)/products' as never)}
      onNotifications={() => router.push('/(shared)/notifications' as never)}
    />
  );
}
