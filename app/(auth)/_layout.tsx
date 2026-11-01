import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout(): React.ReactElement {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="verify-second-factor" />
      <Stack.Screen name="invite/[token]" />
    </Stack>
  );
}
