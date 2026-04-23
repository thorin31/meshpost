import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useStore } from '@store/index';
import { startScanning, stopScanning, syncWithDevice } from '@modules/sync';
import type { SyncPeer } from '../types';

export function NetworkScreen() {
  const { peers, isSyncing, setIsSyncing, addPeer } = useStore();

  const requestBlePermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const results = await Promise.all([
        request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN),
        request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT),
        request(PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE),
        request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION),
      ]);
      return results.every(r => r === RESULTS.GRANTED);
    }
    const result = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    return result === RESULTS.GRANTED;
  }, []);

  const startSync = useCallback(async () => {
    const granted = await requestBlePermissions();
    if (!granted) {
      Alert.alert('Permission requise', 'Activez le Bluetooth dans les paramètres.');
      return;
    }

    setIsSyncing(true);
    startScanning(async (device) => {
      const peer: SyncPeer = {
        device_id: device.id,
        device_name: device.name ?? device.id,
        connected_at: Date.now(),
        posts_exchanged: 0,
      };
      addPeer(peer);

      try {
        const { received, sent } = await syncWithDevice(device);
        addPeer({ ...peer, posts_exchanged: received + sent });
      } catch {
        // La sync a échoué pour ce pair, on continue
      }
    });

    setTimeout(() => {
      stopScanning();
      setIsSyncing(false);
    }, 10_000);
  }, [requestBlePermissions, setIsSyncing, addPeer]);

  const renderPeer = useCallback(({ item }: { item: SyncPeer }) => (
    <View style={styles.peer}>
      <View style={styles.peerDot} />
      <View style={styles.peerInfo}>
        <Text style={styles.peerName}>{item.device_name}</Text>
        <Text style={styles.peerMeta}>{item.posts_exchanged} posts échangés</Text>
      </View>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>
          {isSyncing ? '🔵 Scan en cours...' : '⚪ Inactif'}
        </Text>
        <Text style={styles.statusSub}>
          {peers.length} appareil{peers.length !== 1 ? 's' : ''} détecté{peers.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanBtn, isSyncing && styles.scanBtnActive]}
        onPress={startSync}
        disabled={isSyncing}
      >
        <Text style={styles.scanBtnText}>
          {isSyncing ? 'Scan en cours...' : 'Lancer la synchronisation'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Appareils proches</Text>
      <FlatList
        data={peers}
        keyExtractor={(item) => item.device_id}
        renderItem={renderPeer}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun appareil MeshPost détecté</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  statusCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statusSub: { color: '#888', marginTop: 4 },
  scanBtn: {
    backgroundColor: '#1d9bf0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  scanBtnActive: { backgroundColor: '#444' },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  peer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#222' },
  peerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1d9bf0', marginRight: 12 },
  peerInfo: { flex: 1 },
  peerName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  peerMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  empty: { color: '#555', textAlign: 'center', marginTop: 40 },
});
