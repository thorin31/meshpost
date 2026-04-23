import * as Keychain from 'react-native-keychain';
import { generateKeyPair, sign, verify } from '@utils/crypto';
import type { LocalUser } from '../../types';

const KEYCHAIN_SERVICE = 'meshpost_identity';

export async function createIdentity(displayName: string): Promise<LocalUser> {
  const { publicKey, privateKey } = await generateKeyPair();

  await Keychain.setGenericPassword(
    publicKey,
    JSON.stringify({ privateKey, displayName }),
    { service: KEYCHAIN_SERVICE },
  );

  return { id: publicKey, display_name: displayName, public_key: publicKey };
}

export async function loadIdentity(): Promise<LocalUser | null> {
  const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  if (!creds) return null;

  const { displayName } = JSON.parse(creds.password);
  return {
    id: creds.username,
    display_name: displayName,
    public_key: creds.username,
  };
}

export async function signPost(content: string): Promise<string> {
  const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  if (!creds) throw new Error('No identity found');

  const { privateKey } = JSON.parse(creds.password);
  return sign(content, privateKey);
}

export async function updateDisplayName(name: string): Promise<void> {
  const creds = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
  if (!creds) throw new Error('No identity found');

  const data = JSON.parse(creds.password);
  await Keychain.setGenericPassword(
    creds.username,
    JSON.stringify({ ...data, displayName: name }),
    { service: KEYCHAIN_SERVICE },
  );
}

export { verify };
