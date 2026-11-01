import { useRouter } from 'expo-router';
import { NewQuotationScreen } from '@/screens/manager/NewQuotationScreen';

export default function BranchManagerNewQuotation() {
  const router = useRouter();
  return (
    <NewQuotationScreen
      onBack={() => router.back()}
      onSuccess={(qid) => router.replace(`/(branch-manager)/quotation/${qid}` as never)}
    />
  );
}
