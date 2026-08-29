import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface PackingItemRowProps {
  productName: string;
  binLocation: string;
  orderedQty: number;
  packedQty: string;
  onPackedQtyChange: (value: string) => void;
}

export function PackingItemRow({
  productName,
  binLocation,
  orderedQty,
  packedQty,
  onPackedQtyChange,
}: PackingItemRowProps): React.ReactElement {
  const packed = parseInt(packedQty, 10);
  const isFull = !isNaN(packed) && packed === orderedQty;
  const isShort = !isNaN(packed) && packed < orderedQty;

  return (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-border">
      <View className="flex-1 mr-3">
        <Text className="text-text font-semibold text-sm" numberOfLines={2}>
          {productName}
        </Text>
        <View className="flex-row items-center mt-1 gap-2">
          <View className="bg-primary/10 px-2 py-0.5 rounded-md">
            <Text className="text-primary text-xs font-bold">{binLocation}</Text>
          </View>
          <Text className="text-muted text-xs">Ordered: {orderedQty}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <TextInput
          value={packedQty}
          onChangeText={onPackedQtyChange}
          keyboardType="number-pad"
          placeholder="0"
          className={[
            'w-16 h-10 text-center text-base font-bold rounded-lg border-2',
            isShort ? 'border-warning bg-warning/10 text-warning' : 'border-border bg-surface text-text',
          ].join(' ')}
        />
        {isFull && (
          <Text className="text-success text-xl font-bold">✓</Text>
        )}
        {isShort && (
          <Text className="text-warning text-xl">⚠</Text>
        )}
        {!isFull && !isShort && (
          <View className="w-6" />
        )}
      </View>
    </View>
  );
}
