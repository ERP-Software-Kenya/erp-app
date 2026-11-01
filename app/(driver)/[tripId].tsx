import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useTripDetail,
  useInitiateDelivery,
  useConfirmDelivery,
  useUpdateTripStatus,
} from '../../src/hooks/useTrips';
import { stopGpsTask } from './_layout';
import { OtpInput } from '../../src/components/OtpInput';
import { StatusBadge } from '../../src/components/common/StatusBadge';
import { apiClient } from '../../src/api/client';
import type { DeliveryStop, StopStatus } from '../../src/api/trips.api';

// ── Stop status badge label ───────────────────────────────────────────────────
function stopStatusBadgeStatus(s: StopStatus): 'pending' | 'in_transit' | 'delivered' {
  if (s === 'current') return 'in_transit';
  if (s === 'delivered') return 'delivered';
  return 'pending';
}

// ── OTP Delivery Panel (inline expanded card) ─────────────────────────────────
interface DeliveryPanelProps {
  tripId: string;
  stop: DeliveryStop;
  onDelivered: (stopId: string) => void;
}

function DeliveryPanel({ tripId, stop, onDelivered }: DeliveryPanelProps): React.ReactElement {
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [initiated, setInitiated] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [cashAmount, setCashAmount] = useState('');
  const [cashPaid, setCashPaid] = useState(false);
  const [payingCash, setPayingCash] = useState(false);

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

  const handleInitiate = async (): Promise<void> => {
    try {
      const result = await initiate.mutateAsync({ tripId, stopId: stop.stopId });
      setMaskedEmail(result.maskedEmail);
      setInitiated(true);
      startCountdown();
    } catch {
      Alert.alert('Error', 'Could not send OTP. Try again.');
    }
  };

  const handleResend = async (): Promise<void> => {
    if (resendCountdown > 0) return;
    try {
      await apiClient.post(
        `/v1/field-ops/trips/${tripId}/stops/${stop.stopId}/resend-otp`,
      );
      startCountdown();
    } catch {
      Alert.alert('Error', 'Could not resend OTP. Try again.');
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (otp.length < 6) return;
    try {
      await confirm.mutateAsync({ tripId, stopId: stop.stopId, otp });
      onDelivered(stop.stopId);
    } catch {
      Alert.alert('Wrong OTP', 'The code is incorrect or expired. Try again.');
    }
  };

  const handleRecordCash = async (): Promise<void> => {
    const amount = parseFloat(cashAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid payment amount.');
      return;
    }
    setPayingCash(true);
    try {
      await apiClient.post(`/v1/warehouse/orders/${stop.stopId}/record-payment`, {
        amount,
        method: 'cash',
      });
      setCashPaid(true);
    } catch {
      Alert.alert('Error', 'Could not record payment. Try again.');
    } finally {
      setPayingCash(false);
    }
  };

  return (
    <View
      style={{
        marginTop: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#bfdbfe',
      }}
    >
      {!initiated ? (
        /* Step 1: Initiate delivery */
        <TouchableOpacity
          onPress={handleInitiate}
          disabled={initiate.isPending}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#3b74f5',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          {initiate.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
              Initiate Delivery
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        /* Step 2: OTP entry */
        <View style={{ gap: 14 }}>
          {maskedEmail ? (
            <Text style={{ color: '#64748b', fontSize: 13, textAlign: 'center' }}>
              OTP sent to{' '}
              <Text style={{ color: '#0f172a', fontWeight: '600' }}>{maskedEmail}</Text>
            </Text>
          ) : null}

          <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
            Enter 4-digit OTP sent to customer
          </Text>

          <OtpInput value={otp} onChange={setOtp} />

          {/* Resend */}
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCountdown > 0}
            style={{ alignItems: 'center' }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: resendCountdown > 0 ? '400' : '600',
                color: resendCountdown > 0 ? '#94a3b8' : '#3b74f5',
              }}
            >
              {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>

          {/* Cash payment section */}
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: '#dde5f0',
            }}
          >
            <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Cash Payment (optional)
            </Text>
            {cashPaid ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 16 }}>✅</Text>
                <Text style={{ color: '#16a34a', fontWeight: '600', fontSize: 14 }}>Payment Recorded</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={cashAmount}
                  onChangeText={setCashAmount}
                  placeholder="Amount"
                  keyboardType="decimal-pad"
                  style={{
                    flex: 1,
                    height: 42,
                    borderWidth: 1,
                    borderColor: '#dde5f0',
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    color: '#0f172a',
                    fontSize: 14,
                    backgroundColor: '#f8fafc',
                  }}
                />
                <TouchableOpacity
                  onPress={handleRecordCash}
                  disabled={payingCash || !cashAmount}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 16,
                    height: 42,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: payingCash || !cashAmount ? '#94a3b8' : '#22c55e',
                  }}
                >
                  {payingCash ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>Mark Paid</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Confirm delivery */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={otp.length < 6 || confirm.isPending}
            activeOpacity={0.85}
            style={{
              backgroundColor: otp.length < 6 || confirm.isPending ? '#93c5fd' : '#3b74f5',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            {confirm.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>
                Confirm Delivery
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Stop card ─────────────────────────────────────────────────────────────────
interface StopCardProps {
  stop: DeliveryStop;
  isActive: boolean;
  tripId: string;
  onDelivered: (stopId: string) => void;
}

function StopCard({ stop, isActive, tripId, onDelivered }: StopCardProps): React.ReactElement {
  const isDelivered = stop.status === 'delivered';

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#1e3a5f',
        shadowOpacity: isActive ? 0.12 : 0.05,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: isActive ? 4 : 2,
        borderWidth: isActive ? 1.5 : 1,
        borderColor: isActive ? '#3b74f5' : '#dde5f0',
        opacity: isDelivered ? 0.7 : 1,
      }}
    >
      {/* Left accent */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
          backgroundColor: isDelivered ? '#22c55e' : isActive ? '#3b74f5' : '#dde5f0',
        }}
      />

      <View style={{ paddingLeft: 20, paddingRight: 16, paddingVertical: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: isDelivered ? '#22c55e' : isActive ? '#3b74f5' : '#e2e8f0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>
                  {stop.sequence}
                </Text>
              </View>
              <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 15 }}>
                {stop.customerName}
              </Text>
            </View>
            <Text style={{ color: '#64748b', fontSize: 13, marginLeft: 30 }}>{stop.address}</Text>
          </View>
          <StatusBadge status={stopStatusBadgeStatus(stop.status)} />
        </View>

        {isActive && (
          <DeliveryPanel tripId={tripId} stop={stop} onDelivered={onDelivered} />
        )}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function TripDetailScreen(): React.ReactElement {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const insets = useSafeAreaInsets();
  const { data: trip, isLoading } = useTripDetail(tripId);
  const updateStatus = useUpdateTripStatus();

  const deliveredCount = trip?.stops.filter((s) => s.status === 'delivered').length ?? 0;
  const totalCount = trip?.stopCount ?? 0;
  const progress = totalCount > 0 ? deliveredCount / totalCount : 0;

  const handleDelivered = useCallback(
    (stopId: string): void => {
      const allDone = trip?.stops.every(
        (s) => s.stopId === stopId || s.status === 'delivered',
      );
      if (allDone) {
        void updateStatus
          .mutateAsync({ tripId, status: 'completed' })
          .then(() => stopGpsTask())
          .then(() =>
            Alert.alert('Trip Complete!', 'All stops delivered. Great work!', [
              { text: 'OK', onPress: () => router.replace('/(driver)') },
            ]),
          )
          .catch(() =>
            Alert.alert(
              'Delivery recorded',
              'The trip status will be retried when connectivity returns.',
            ),
          );
      }
    },
    [trip, tripId, updateStatus],
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#f0f4f8',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: insets.top,
        }}
      >
        <ActivityIndicator size="large" color="#3b74f5" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8', paddingTop: insets.top }}>
      {/* Custom header with back button */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#dde5f0',
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#f0f4f8',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, color: '#0f172a' }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 18, letterSpacing: -0.3 }}>
              Trip #{trip?.tripNumber}
            </Text>
            {trip?.vehiclePlate ? (
              <Text style={{ color: '#64748b', fontSize: 12, marginTop: 1 }}>
                {trip.vehiclePlate}
              </Text>
            ) : null}
          </View>
          <View
            style={{
              backgroundColor: '#eff6ff',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: '#3b74f5', fontSize: 12, fontWeight: '700' }}>
              {deliveredCount}/{totalCount} done
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              flex: 1,
              height: 6,
              backgroundColor: '#f0f4f8',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                backgroundColor: '#22c55e',
                borderRadius: 3,
              }}
            />
          </View>
          <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', minWidth: 60 }}>
            {Math.round(progress * 100)}% done
          </Text>
        </View>
      </View>

      {/* Stop list */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 12 }}>
          {deliveredCount} of {totalCount} stops delivered
        </Text>

        {(trip?.stops ?? []).map((stop) => {
          const isActive = stop.status === 'current';
          return (
            <StopCard
              key={stop.stopId}
              stop={stop}
              isActive={isActive}
              tripId={tripId}
              onDelivered={handleDelivered}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
