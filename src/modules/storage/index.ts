import { open } from '@op-engineering/op-sqlite';
import type { Post } from '../../types';
import { POST_TTL_MS } from '../../types';

let db: ReturnType<typeof open> | null = null;

export function initDB(): void {
  db = open({ name: 'meshpost.db' });
  db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      signature TEXT NOT NULL,
      hops INTEGER NOT NULL DEFAULT 0
    )
  `);
  db.execute('CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp)');
}

function getDB() {
  if (!db) throw new Error('DB not initialized — call initDB() first');
  return db;
}

export function insertPost(post: Post): boolean {
  const database = getDB();
  const exists = database.execute('SELECT id FROM posts WHERE id = ?', [post.id]);
  if (exists.rows && exists.rows.length > 0) return false;

  database.execute(
    'INSERT INTO posts (id, author_id, author_name, content, timestamp, signature, hops) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [post.id, post.author_id, post.author_name, post.content, post.timestamp, post.signature, post.hops],
  );
  return true;
}

export function getRecentPosts(): Post[] {
  const since = Date.now() - POST_TTL_MS;
  const result = getDB().execute(
    'SELECT * FROM posts WHERE timestamp > ? ORDER BY timestamp DESC',
    [since],
  );
  return (result.rows?._array ?? []) as Post[];
}

export function getPostIds(): string[] {
  const since = Date.now() - POST_TTL_MS;
  const result = getDB().execute(
    'SELECT id FROM posts WHERE timestamp > ?',
    [since],
  );
  return ((result.rows?._array ?? []) as { id: string }[]).map(r => r.id);
}

export function getPostsByIds(ids: string[]): Post[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const result = getDB().execute(
    `SELECT * FROM posts WHERE id IN (${placeholders})`,
    ids,
  );
  return (result.rows?._array ?? []) as Post[];
}

export function pruneOldPosts(): number {
  const cutoff = Date.now() - POST_TTL_MS;
  const result = getDB().execute('DELETE FROM posts WHERE timestamp <= ?', [cutoff]);
  return result.rowsAffected ?? 0;
}

export function getPostCount(): number {
  const result = getDB().execute('SELECT COUNT(*) as count FROM posts');
  return (result.rows?._array?.[0] as { count: number })?.count ?? 0;
}
