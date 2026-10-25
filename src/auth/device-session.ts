import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import type { DeviceSessionRequest } from '../api/auth.api';

export async function getDeviceSession(): Promise<DeviceSessionRequest> {
  const installationId = Platform.OS === 'android'
    ? Application.getAndroidId()
    : await Application.getIosIdForVendorAsync();

  return {
    deviceId: installationId ?? `${Platform.OS}-unknown-device`,
    deviceName: Device.deviceName ?? Device.modelName ?? `${Platform.OS} device`,
    platform: Platform.OS,
    appVersion: Application.nativeApplicationVersion ?? undefined,
  };
}
