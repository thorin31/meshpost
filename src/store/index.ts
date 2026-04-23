import { create } from 'zustand';
import type { Post, LocalUser, SyncPeer } from '../types';

interface AppState {
  user: LocalUser | null;
  posts: Post[];
  peers: SyncPeer[];
  isSyncing: boolean;

  setUser: (user: LocalUser | null) => void;
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  addPeer: (peer: SyncPeer) => void;
  removePeer: (deviceId: string) => void;
  setIsSyncing: (syncing: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  posts: [],
  peers: [],
  isSyncing: false,

  setUser: (user) => set({ user }),
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  addPeer: (peer) =>
    set((state) => ({
      peers: [peer, ...state.peers.filter((p) => p.device_id !== peer.device_id)],
    })),
  removePeer: (deviceId) =>
    set((state) => ({ peers: state.peers.filter((p) => p.device_id !== deviceId) })),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
}));
