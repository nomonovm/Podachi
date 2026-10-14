/**
 * PODACHI Cryptography Utilities
 * Uses Web Crypto API (NIST approved algorithms: SHA-256, AES-256-GCM)
 * Strictly educational and production-grade demonstration for University course
 */

// Buffer to Hex string helper
export function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hex string to Uint8Array helper
export function hex2buf(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * SHA-256 One-Way Cryptographic Hash
 * Irreversible, fixed 256-bit (64 hex characters) output
 */
export async function sha256Hash(message: string, salt: string = ''): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(hashBuffer);
}

/**
 * Generate AES-GCM 256-bit symmetric encryption key
 */
export async function generateAesKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export CryptoKey to Base64 format
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  const bytes = new Uint8Array(exported);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Import Base64 string back into CryptoKey
 */
export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const binary = atob(base64Key);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return await crypto.subtle.importKey(
    'raw',
    bytes.buffer,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Symmetric Encryption via AES-256-GCM
 * Requires a fresh 96-bit (12-byte) Initialization Vector (IV/Nonce) for every encryption
 */
export async function encryptAesGcm(plainText: string, customKeyBase64?: string): Promise<{
  cipherTextHex: string;
  ivHex: string;
  keyBase64: string;
}> {
  let key: CryptoKey;
  let keyBase64 = customKeyBase64;

  if (customKeyBase64) {
    key = await importKeyFromBase64(customKeyBase64);
  } else {
    key = await generateAesKey();
    keyBase64 = await exportKeyToBase64(key);
  }

  // Generate 12-byte cryptographically random IV (NIST recommended for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(plainText);

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedText
  );

  return {
    cipherTextHex: buf2hex(cipherBuffer),
    ivHex: buf2hex(iv.buffer),
    keyBase64: keyBase64!,
  };
}

/**
 * Symmetric Decryption via AES-256-GCM
 * Authenticates message integrity (detects tampering) and recovers original text
 */
export async function decryptAesGcm(
  cipherTextHex: string,
  ivHex: string,
  keyBase64: string
): Promise<string> {
  const key = await importKeyFromBase64(keyBase64);
  const iv = hex2buf(ivHex);
  const cipherBytes = hex2buf(cipherTextHex);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      cipherBytes as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Deshifrlash xatosi: Noto\'g\'ri kalit, buzilgan IV yoki ma\'lumot o\'zgartirilgan (GCM autentifikatsiyasi xatosi).');
  }
}
