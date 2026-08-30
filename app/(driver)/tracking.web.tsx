import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TrackingScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="bg-white border-b border-border px-4 py-3">
        <Text className="text-text font-bold text-lg">Live Tracking</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-muted text-center text-sm">
          Live map tracking is only available on the mobile app.
        </Text>
      </View>
    </View>
  );
}
