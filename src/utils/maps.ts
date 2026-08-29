import { Linking, Platform } from 'react-native';

export function openMapsToAddress(address: string): void {
  const encoded = encodeURIComponent(address);
  const url =
    Platform.OS === 'ios'
      ? `maps://?daddr=${encoded}`
      : `geo:0,0?q=${encoded}`;

  Linking.canOpenURL(url).then((supported) => {
    if (supported) {
      Linking.openURL(url);
    } else {
      const fallback = `https://maps.google.com/?q=${encoded}`;
      Linking.openURL(fallback);
    }
  });
}

export function buildOsmTileUrl(): string {
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
}
