import { Stack } from 'expo-router';

export default function SharedLayout(): React.ReactElement {
  return <Stack screenOptions={{ headerShown: false }} />;
}
