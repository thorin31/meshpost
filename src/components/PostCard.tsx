import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Post } from '../types';

interface Props {
  post: Post;
}

export function PostCard({ post }: Props) {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), {
    addSuffix: true,
    locale: fr,
  });

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{post.author_name[0]?.toUpperCase()}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.name}>{post.author_name}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        <Text style={styles.content}>{post.content}</Text>
        {post.hops > 0 && (
          <Text style={styles.hops}>↪ {post.hops} relais</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  body: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  name: { color: '#fff', fontWeight: '700', fontSize: 15 },
  time: { color: '#555', fontSize: 12 },
  content: { color: '#e7e9ea', fontSize: 15, lineHeight: 22 },
  hops: { color: '#555', fontSize: 11, marginTop: 6 },
});
