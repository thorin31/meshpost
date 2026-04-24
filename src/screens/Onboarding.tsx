import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createIdentity } from '@modules/identity';
import { useStore } from '@store/index';

export function OnboardingScreen() {
  const { setUser } = useStore();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const user = await createIdentity(name.trim());
      setUser(user);
    } catch (e) {
      console.error('[Onboarding] createIdentity failed:', e);
      Alert.alert('Erreur', 'Impossible de créer votre profil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>◉</Text>
        <Text style={styles.title}>MeshPost</Text>
        <Text style={styles.subtitle}>
          Le réseau social hors-ligne.{'\n'}Vos posts voyagent de téléphone en téléphone via Bluetooth.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Choisissez un pseudo"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          maxLength={30}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
          color="#fff"
        />

        <TouchableOpacity
          style={[styles.btn, (!name.trim() || loading) && styles.btnDisabled]}
          onPress={handleCreate}
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Créer mon profil</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Votre identité est générée localement.{'\n'}Aucune donnée n'est envoyée sur internet.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 20,
  },
  logo: { fontSize: 64, color: '#1d9bf0' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', lineHeight: 24 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: '#111',
  },
  btn: {
    width: '100%',
    backgroundColor: '#1d9bf0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  note: { color: '#444', fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
