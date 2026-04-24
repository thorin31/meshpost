import React, { useCallback, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@store/index';
import { getRecentPosts, pruneOldPosts } from '@modules/storage';
import { PostCard } from '@components/PostCard';
import type { Post } from '../types';

export function FeedScreen() {
  const navigation = useNavigation<any>();
  const { posts, setPosts, isSyncing } = useStore();

  const refresh = useCallback(async () => {
    await pruneOldPosts();
    setPosts(await getRecentPosts());
  }, [setPosts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const renderItem = useCallback(({ item }: { item: Post }) => (
    <PostCard post={item} />
  ), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isSyncing} onRefresh={refresh} />
        }
        ListEmptyComponent={<EmptyFeed />}
        contentContainerStyle={posts.length === 0 && styles.emptyContainer}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Compose')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyFeed() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Aucun post pour l'instant</Text>
      <Text style={styles.emptySubtitle}>
        Rapprochez-vous d'autres utilisateurs pour recevoir leurs posts via Bluetooth.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: '#888', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1d9bf0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
