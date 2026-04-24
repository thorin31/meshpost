import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@store/index';
import { signPost } from '@modules/identity';
import { insertPost } from '@modules/storage';
import { hashPost } from '@utils/crypto';
import type { Post } from '../types';
import { MAX_CONTENT_LENGTH } from '../types';

export function ComposeScreen() {
  const navigation = useNavigation();
  const { user, addPost } = useStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const remaining = MAX_CONTENT_LENGTH - content.length;
  const canPost = content.trim().length > 0 && remaining >= 0 && !loading;

  async function handlePost() {
    if (!user || !canPost) return;
    setLoading(true);
    try {
      const timestamp = Date.now();
      const message = `${user.id}:${timestamp}:${content.trim()}`;
      const signature = await signPost(message);
      const post: Post = {
        id: hashPost(user.id, timestamp, content.trim()),
        author_id: user.id,
        author_name: user.display_name,
        content: content.trim(),
        timestamp,
        signature,
        hops: 0,
      };
      await insertPost(post);
      addPost(post);
      navigation.goBack();
    } catch (e) {
      console.error('[Compose] handlePost failed:', e);
      Alert.alert('Erreur', 'Impossible de publier le post.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={!canPost}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.postBtnText}>Publier</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Quoi de neuf ?"
        placeholderTextColor="#555"
        multiline
        autoFocus
        maxLength={MAX_CONTENT_LENGTH + 10}
        value={content}
        onChangeText={setContent}
        color="#fff"
      />

      <View style={styles.footer}>
        <Text style={[styles.counter, remaining < 20 && styles.counterWarning]}>
          {remaining}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  cancel: { color: '#fff', fontSize: 16 },
  postBtn: {
    backgroundColor: '#1d9bf0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  postBtnDisabled: { opacity: 0.5 },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 18,
    textAlignVertical: 'top',
  },
  footer: { padding: 16, alignItems: 'flex-end' },
  counter: { color: '#888', fontSize: 14 },
  counterWarning: { color: '#f4212e' },
});
