import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useStore } from '@store/index';
import { updateDisplayName } from '@modules/identity';
import { getPostCount } from '@modules/storage';

export function ProfileScreen() {
  const { user, setUser } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.display_name ?? '');
  const postCount = getPostCount();

  async function handleSaveName() {
    if (!name.trim() || !user) return;
    try {
      await updateDisplayName(name.trim());
      setUser({ ...user, display_name: name.trim() });
      setEditing(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder le nom.');
    }
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.display_name[0]?.toUpperCase()}</Text>
      </View>

      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={30}
            color="#fff"
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
            <Text style={styles.saveBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)}>
          <Text style={styles.displayName}>{user.display_name} ✎</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.publicKey} numberOfLines={1} ellipsizeMode="middle">
        {user.public_key}
      </Text>

      <View style={styles.stats}>
        <Stat label="Posts locaux" value={postCount} />
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Votre identité est générée localement et ne quitte jamais cet appareil.
          Vos posts sont signés cryptographiquement avec votre clé privée.
        </Text>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', paddingTop: 40, padding: 16 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1d9bf0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  displayName: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  editRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  nameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#1d9bf0',
    fontSize: 20,
    paddingVertical: 4,
    minWidth: 150,
  },
  saveBtn: { backgroundColor: '#1d9bf0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  publicKey: { color: '#555', fontSize: 11, maxWidth: 280, marginBottom: 24 },
  stats: { flexDirection: 'row', gap: 32, marginBottom: 32 },
  stat: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#888', fontSize: 12, marginTop: 2 },
  info: { backgroundColor: '#111', borderRadius: 12, padding: 16, maxWidth: 320 },
  infoText: { color: '#888', fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
