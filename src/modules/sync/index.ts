import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { getPostIds, getPostsByIds, insertPost } from '@modules/storage';
import { verify } from '@modules/identity';
import { decodeChunks, encodeChunks } from '@utils/chunker';
import { SERVICE_UUID, CHAR_POST_IDS_UUID, CHAR_POSTS_UUID, SCAN_DURATION_MS } from '@modules/bluetooth/constants';
import type { Post } from '../../types';
import { POST_TTL_MS, MAX_HOPS } from '../../types';

let manager: BleManager | null = null;

export function getBleManager(): BleManager {
  if (!manager) manager = new BleManager();
  return manager;
}

export function destroyBleManager(): void {
  manager?.destroy();
  manager = null;
}

// Vérifie qu'un post reçu est valide avant de le stocker
async function validatePost(post: Post): Promise<boolean> {
  if (!post.id || !post.author_id || !post.content || !post.timestamp) return false;
  if (Date.now() - post.timestamp > POST_TTL_MS) return false;
  if (post.hops > MAX_HOPS) return false;

  const message = `${post.author_id}:${post.timestamp}:${post.content}`;
  return verify(message, post.signature, post.author_id);
}

async function readAllChunks(device: Device, charUUID: string): Promise<object> {
  const chunks: Buffer[] = [];
  const totalMap = new Map<number, number>();

  await new Promise<void>((resolve, reject) => {
    device.monitorCharacteristicForService(SERVICE_UUID, charUUID, (err, char) => {
      if (err) { reject(err); return; }
      if (!char?.value) return;

      const buf = Buffer.from(char.value, 'base64');
      const index = buf.readUInt8(0);
      const total = buf.readUInt8(1);
      chunks.push(buf);
      totalMap.set(index, total);

      if (chunks.length >= total) resolve();
    });
  });

  return decodeChunks(chunks);
}

async function writeChunks(device: Device, charUUID: string, data: object): Promise<void> {
  const chunks = encodeChunks(data);
  for (const chunk of chunks) {
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      charUUID,
      chunk.toString('base64'),
    );
  }
}

export async function syncWithDevice(device: Device): Promise<{ received: number; sent: number }> {
  await device.connect({ timeout: 15000 });
  await device.discoverAllServicesAndCharacteristics();

  // Étape 1 : échange des listes d'IDs
  const remoteIds = (await readAllChunks(device, CHAR_POST_IDS_UUID)) as { ids: string[] };
  const localIds = getPostIds();

  // Étape 2 : calcul des différences
  const localSet = new Set(localIds);
  const remoteSet = new Set(remoteIds.ids);
  const missingLocally = remoteIds.ids.filter(id => !localSet.has(id));
  const missingRemotely = localIds.filter(id => !remoteSet.has(id));

  // Étape 3 : envoyer nos IDs manquants au pair
  await writeChunks(device, CHAR_POST_IDS_UUID, { ids: localIds });

  // Étape 4 : recevoir les posts manquants
  let received = 0;
  if (missingLocally.length > 0) {
    await writeChunks(device, CHAR_POSTS_UUID, { request: missingLocally });
    const data = (await readAllChunks(device, CHAR_POSTS_UUID)) as { posts: Post[] };
    for (const post of data.posts) {
      const valid = await validatePost(post);
      if (valid) {
        const isNew = insertPost({ ...post, hops: post.hops + 1 });
        if (isNew) received++;
      }
    }
  }

  // Étape 5 : envoyer les posts demandés
  const toSend = getPostsByIds(missingRemotely);
  if (toSend.length > 0) {
    await writeChunks(device, CHAR_POSTS_UUID, { posts: toSend });
  }

  await device.cancelConnection();
  return { received, sent: toSend.length };
}

export function startScanning(onPeerFound: (device: Device) => void): void {
  const ble = getBleManager();
  ble.startDeviceScan([SERVICE_UUID], null, (error, device) => {
    if (error || !device) return;
    onPeerFound(device);
  });

  setTimeout(() => ble.stopDeviceScan(), SCAN_DURATION_MS);
}

export function stopScanning(): void {
  getBleManager().stopDeviceScan();
}
