import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Order } from '../api/orders.api';

interface OrderCardProps {
  order: Order;
  onClaim: (orderId: string) => void;
  isClaiming?: boolean;
}

export function OrderCard({ order, onClaim, isClaiming = false }: OrderCardProps): React.ReactElement {
  return (
    <View className="mx-4 my-2 rounded-2xl bg-white border border-border shadow-sm overflow-hidden">
      <View
        className={[
          'h-1',
          order.urgency === 'urgent' ? 'bg-destructive' : 'bg-primary',
        ].join(' ')}
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-text font-bold text-base">
              #{order.orderNumber}
            </Text>
            <Text className="text-muted text-sm mt-0.5">{order.customerName}</Text>
          </View>
          <View
            className={[
              'px-2 py-1 rounded-full',
              order.urgency === 'urgent' ? 'bg-destructive/10' : 'bg-primary/10',
            ].join(' ')}
          >
            <Text
              className={[
                'text-xs font-bold uppercase',
                order.urgency === 'urgent' ? 'text-destructive' : 'text-primary',
              ].join(' ')}
            >
              {order.urgency === 'urgent' ? 'Urgent' : 'Normal'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mb-3 flex-wrap">
          {order.binLocations.map((bin) => (
            <View key={bin} className="bg-surface px-2 py-0.5 rounded-md border border-border">
              <Text className="text-muted text-xs font-medium">{bin}</Text>
            </View>
          ))}
          <Text className="text-muted text-xs">{order.itemCount} items</Text>
        </View>

        <TouchableOpacity
          className={[
            'rounded-xl py-3 items-center',
            isClaiming ? 'bg-primary/50' : 'bg-primary',
          ].join(' ')}
          onPress={() => onClaim(order.id)}
          disabled={isClaiming}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-sm">
            {isClaiming ? 'Claiming…' : 'Claim →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
