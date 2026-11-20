import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  recordSalePaymentApi,
  type RecordPaymentPayload,
} from '@/api/manager/payments.api';

export function useRecordSalePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) => recordSalePaymentApi(payload),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: ['sales-orders', 'detail', variables.orderId] });
      void qc.invalidateQueries({ queryKey: ['sales-orders', 'list'] });
    },
  });
}
