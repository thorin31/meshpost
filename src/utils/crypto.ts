import { subtle } from 'react-native-quick-crypto';

export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = await subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify'],
  );

  const pubRaw = await subtle.exportKey('raw', keyPair.publicKey);
  const privRaw = await subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: Buffer.from(pubRaw as ArrayBuffer).toString('hex'),
    privateKey: Buffer.from(privRaw as ArrayBuffer).toString('hex'),
  };
}

export async function sign(message: string, privateKeyHex: string): Promise<string> {
  const keyData = Buffer.from(privateKeyHex, 'hex');
  const privateKey = await subtle.importKey(
    'pkcs8',
    keyData,
    { name: 'Ed25519' },
    false,
    ['sign'],
  );

  const msgBuffer = new TextEncoder().encode(message);
  const sigBuffer = await subtle.sign('Ed25519', privateKey, msgBuffer);
  return Buffer.from(sigBuffer).toString('hex');
}

export async function verify(
  message: string,
  signatureHex: string,
  publicKeyHex: string,
): Promise<boolean> {
  try {
    const keyData = Buffer.from(publicKeyHex, 'hex');
    const publicKey = await subtle.importKey(
      'raw',
      keyData,
      { name: 'Ed25519' },
      false,
      ['verify'],
    );

    const msgBuffer = new TextEncoder().encode(message);
    const sigBuffer = Buffer.from(signatureHex, 'hex');
    return subtle.verify('Ed25519', publicKey, sigBuffer, msgBuffer);
  } catch {
    return false;
  }
}

export function hashPost(authorId: string, timestamp: number, content: string): string {
  const raw = `${authorId}:${timestamp}:${content}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (Math.imul(31, hash) + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + Date.now().toString(16);
}
