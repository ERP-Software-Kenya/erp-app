import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTripDetail,
  useInitiateDelivery,
  useConfirmDelivery,
} from '../../src/hooks/useTrips';
import { StopItem } from '../../src/components/StopItem';
import { OtpInput } from '../../src/components/OtpInput';
import type { DeliveryStop } from '../../src/api/trips.api';

interface OtpModalProps {
  visible: boolean;
  tripId: string;
  stop: DeliveryStop | null;
  onClose: () => void;
  onDelivered: (stopId: string) => void;
}

function OtpModal({
  visible,
  tripId,
  stop,
  onClose,
  onDelivered,
}: OtpModalProps): React.ReactElement | null {
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const initiate = useInitiateDelivery();
  const confirm = useConfirmDelivery();

  const startCountdown = useCallback((): void => {
    setResendCountdown(60);
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  React.useEffect(() => {
    if (visible && stop) {
      setOtp('');
      setMaskedEmail('');
      void initiateOtp();
    }
  }, [visible, stop?.stopId]);

  const initiateOtp = async (): Promise<void> => {
    if (!stop) return;
    try {
      const result = await initiate.mutateAsync({ tripId, stopId: stop.stopId });
      setMaskedEmail(result.maskedEmail);
      startCountdown();
    } catch {
      Alert.alert('Error', 'Could not send OTP. Try again.');
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (!stop || otp.length < 6) return;
    try {
      await confirm.mutateAsync({ tripId, stopId: stop.stopId, otp });
      onDelivered(stop.stopId);
      onClose();
    } catch {
      Alert.alert('Wrong OTP', 'The code is incorrect or expired. Try again.');
    }
  };

  if (!stop) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-white"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-row items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <Text className="text-text font-bold text-lg">Confirm Delivery</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Text className="text-muted text-base">✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingTop: 24, gap: 24 }}>
          <View className="items-center">
            <Text className="text-muted text-sm mb-1">Delivering to</Text>
            <Text className="text-text font-bold text-xl">{stop.customerName}</Text>
            <Text className="text-muted text-sm mt-1">{stop.address}</Text>
          </View>

          {maskedEmail ? (
            <View className="items-center">
              <Text className="text-muted text-sm">
                OTP sent to{' '}
                <Text className="text-text font-semibold">{maskedEmail}</Text>
              </Text>
            </View>
          ) : (
            <ActivityIndicator color="#3b74f5" />
          )}

          <OtpInput value={otp} onChange={setOtp} />

          <TouchableOpacity
            onPress={resendCountdown === 0 ? initiateOtp : undefined}
            disabled={resendCountdown > 0}
            className="items-center"
          >
            <Text
              className={resendCountdown > 0 ? 'text-muted text-sm' : 'text-primary text-sm font-semibold'}
            >
              {resendCountdown > 0
                ? `Resend code in ${resendCountdown}s`
                : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="px-5 pt-4 border-t border-border">
          <TouchableOpacity
            className={[
              'rounded-xl py-4 items-center',
              otp.length < 6 || confirm.isPending ? 'bg-primary/50' : 'bg-primary',
            ].join(' ')}
            onPress={handleConfirm}
            disabled={otp.length < 6 || confirm.isPending}
            activeOpacity={0.85}
          >
            {confirm.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-base">Confirm Delivery</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function TripDetailScreen(): React.ReactElement {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const insets = useSafeAreaInsets();
  const { data: trip, isLoading } = useTripDetail(tripId);
  const [otpStop, setOtpStop] = useState<DeliveryStop | null>(null);

  const deliveredCount = trip?.stops.filter((s) => s.status === 'delivered').length ?? 0;
  const totalCount = trip?.stopCount ?? 0;
  const progress = totalCount > 0 ? deliveredCount / totalCount : 0;

  const handleDelivered = useCallback(
    (stopId: string): void => {
      const allDone = trip?.stops.every(
        (s) => s.stopId === stopId || s.status === 'delivered',
      );
      if (allDone) {
        Alert.alert(
          'Trip Complete!',
          'All stops delivered. Great work!',
          [{ text: 'OK', onPress: () => router.replace('/(driver)') }],
        );
      }
    },
    [trip],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#3b74f5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white border-b border-border px-4 py-4">
        <View className="flex-row items-center gap-3 mb-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Text className="text-primary text-base font-semibold">← Back</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-text font-bold text-lg">
              Trip #{trip?.tripNumber}
            </Text>
            <Text className="text-muted text-sm">{trip?.vehiclePlate}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-success rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className="text-muted text-xs font-semibold">
            {deliveredCount}/{totalCount} delivered
          </Text>
        </View>
      </View>

      {/* Stop list */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {(trip?.stops ?? []).map((stop, idx) => (
          <StopItem
            key={stop.stopId}
            stop={stop}
            isLast={idx === (trip?.stops.length ?? 0) - 1}
            onDeliver={(s) => setOtpStop(s)}
          />
        ))}
      </ScrollView>

      <OtpModal
        visible={otpStop !== null}
        tripId={tripId}
        stop={otpStop}
        onClose={() => setOtpStop(null)}
        onDelivered={handleDelivered}
      />
    </View>
  );
}
