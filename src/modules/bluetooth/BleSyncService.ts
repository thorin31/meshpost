import { NativeModules, Platform } from 'react-native';

const { BleSyncModule } = NativeModules;

export function startBleSyncService(): void {
  if (Platform.OS === 'android' && BleSyncModule) {
    BleSyncModule.startService();
  }
}

export function stopBleSyncService(): void {
  if (Platform.OS === 'android' && BleSyncModule) {
    BleSyncModule.stopService();
  }
}
