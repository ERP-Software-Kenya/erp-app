import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PickerActiveScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-surface items-center justify-center" style={{ paddingTop: insets.top }}>
      <Text className="text-text font-bold text-xl">Active Order</Text>
      <Text className="text-muted text-sm mt-2">Your claimed order will appear here</Text>
    </View>
  );
}
