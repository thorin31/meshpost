export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  timestamp: number;
  signature: string;
  hops: number;
}

export interface LocalUser {
  id: string;
  display_name: string;
  public_key: string;
}

export interface SyncPeer {
  device_id: string;
  device_name: string;
  connected_at: number;
  posts_exchanged: number;
}

export const POST_TTL_MS = 24 * 60 * 60 * 1000; // 24h
export const MAX_CONTENT_LENGTH = 280;
export const MAX_HOPS = 10;
