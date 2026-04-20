/**
 * Unified hashing utility — uses WebCrypto for SHA variants,
 * falls back to JS libraries for algorithms not in WebCrypto.
 *
 * Usage:
 *   import { hash } from '../utils/hashing';
 *   const digest = await hash('SHA-256', 'hello world');
 */

/**
 * Compute a hex-encoded hash using the browser's WebCrypto API.
 * Supports: SHA-1, SHA-256, SHA-384, SHA-512.
 *
 * @param {'SHA-1'|'SHA-256'|'SHA-384'|'SHA-512'} algorithm
 * @param {string} text - Input text to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function hash(algorithm, text) {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest(algorithm, buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Convenience wrappers */
export const sha1 = (text) => hash('SHA-1', text);
export const sha256 = (text) => hash('SHA-256', text);
export const sha384 = (text) => hash('SHA-384', text);
export const sha512 = (text) => hash('SHA-512', text);
