import { useRouter } from 'expo-router';
import { NewQuotationScreen } from '@/screens/manager/NewQuotationScreen';

export default function OrgAdminNewQuotation() {
  const router = useRouter();
  return (
    <NewQuotationScreen
      onBack={() => router.back()}
      onSuccess={(qid) => router.replace(`/(org-admin)/quotation/${qid}` as never)}
    />
  );
}
