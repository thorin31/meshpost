import nacl from 'tweetnacl';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const keyPair = nacl.sign.keyPair();
  return {
    publicKey: bytesToHex(keyPair.publicKey),
    privateKey: bytesToHex(keyPair.secretKey),
  };
}

export async function sign(message: string, privateKeyHex: string): Promise<string> {
  const msgBytes = stringToBytes(message);
  const privBytes = hexToBytes(privateKeyHex);
  console.log('[crypto] sign - nacl:', typeof nacl, '| msgBytes:', Object.prototype.toString.call(msgBytes), msgBytes.length, '| privBytes:', Object.prototype.toString.call(privBytes), privBytes.length);
  const signed = nacl.sign(msgBytes, privBytes);
  return bytesToHex(signed.slice(0, nacl.sign.signatureLength));
}

export async function verify(
  message: string,
  signatureHex: string,
  publicKeyHex: string,
): Promise<boolean> {
  try {
    const msgBytes = stringToBytes(message);
    const sigBytes = hexToBytes(signatureHex);
    const pubBytes = hexToBytes(publicKeyHex);
    const signedMsg = new Uint8Array(sigBytes.length + msgBytes.length);
    signedMsg.set(sigBytes);
    signedMsg.set(msgBytes, sigBytes.length);
    return nacl.sign.open(signedMsg, pubBytes) !== null;
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
