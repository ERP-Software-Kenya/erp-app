import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { DeliveryStop } from '../api/trips.api';
import { openMapsToAddress } from '../utils/maps';

interface StopItemProps {
  stop: DeliveryStop;
  isLast: boolean;
  onDeliver: (stop: DeliveryStop) => void;
}

export function StopItem({ stop, isLast, onDeliver }: StopItemProps): React.ReactElement {
  const isDone = stop.status === 'delivered';
  const isCurrent = stop.status === 'current';

  const dotColor = isDone
    ? 'bg-success'
    : isCurrent
    ? 'bg-primary'
    : 'bg-muted/40';

  return (
    <View className="flex-row">
      {/* Timeline column */}
      <View className="items-center w-8 mr-3">
        <View className={`w-4 h-4 rounded-full mt-4 ${dotColor}`} />
        {!isLast && <View className="w-0.5 flex-1 bg-border mt-1" />}
      </View>

      {/* Card column */}
      <View
        className={[
          'flex-1 mb-3 rounded-2xl p-4 border',
          isDone ? 'bg-surface border-border opacity-60' : isCurrent ? 'bg-white border-primary' : 'bg-surface border-border',
        ].join(' ')}
      >
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className={[
              'font-bold text-sm',
              isDone ? 'line-through text-muted' : 'text-text',
            ].join(' ')}
          >
            Stop {stop.sequence} — {stop.customerName}
          </Text>
          {isDone && (
            <Text className="text-success text-xs font-bold">Delivered ✓</Text>
          )}
        </View>

        <Text
          className={[
            'text-xs mb-3',
            isDone ? 'line-through text-muted' : 'text-muted',
          ].join(' ')}
        >
          {stop.address}
        </Text>

        {isCurrent && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 border border-primary rounded-xl py-2.5 items-center"
              onPress={() => openMapsToAddress(stop.address)}
              activeOpacity={0.8}
            >
              <Text className="text-primary font-semibold text-sm">↗ Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primary rounded-xl py-2.5 items-center"
              onPress={() => onDeliver(stop)}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-sm">Deliver →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
