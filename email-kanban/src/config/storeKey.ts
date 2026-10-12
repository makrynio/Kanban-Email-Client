import Store from 'electron-store';

// Returns the key used to encrypt locally stored credentials and tokens.
// Uses VITE_STORE_ENCRYPTION_KEY if provided, otherwise generates a random
// per-install key on first run. No key is hardcoded in the source.
// Note: a key stored next to the data only obfuscates it at rest. For stronger
// protection, move this to the OS keychain (e.g. Electron safeStorage).
export function getStoreEncryptionKey(): string {
  const fromEnv = import.meta.env.VITE_STORE_ENCRYPTION_KEY as string | undefined;
  if (fromEnv) return fromEnv;

  const keyStore = new Store({ name: 'install-key' });
  let key = keyStore.get('key') as string | undefined;
  if (!key) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    key = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    keyStore.set('key', key);
  }
  return key;
}
