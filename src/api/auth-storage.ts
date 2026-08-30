import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'erp-auth' });

export const authStorage = {
  getString: (key: string): string | undefined => mmkv.getString(key),
  set: (key: string, value: string): void => mmkv.set(key, value),
  delete: (key: string): void => mmkv.delete(key),
};
