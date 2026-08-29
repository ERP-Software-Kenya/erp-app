import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export function OfflineBanner(): React.ReactElement | null {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <View className="bg-warning px-4 py-2 items-center">
      <Text className="text-white text-sm font-semibold">
        Offline — changes will sync when reconnected
      </Text>
    </View>
  );
}
