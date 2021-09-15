import { concatByteArrays } from 'micro-stacks/common';
import { Sha256 } from 'micro-stacks/crypto-sha';
import { Hmac } from './hmac-shim';
import { createHmac } from 'crypto';

export async function hmacSha256(key: Uint8Array, ...messages: Uint8Array[]): Promise<Uint8Array> {
  // TODO: check for deno (or similar lack of support) here
  if (typeof self == 'object' && 'crypto' in self) {
    const ckey = await self.crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );
    const input = messages.length === 1 ? messages[0] : concatByteArrays(messages);
    const buffer = await self.crypto.subtle.sign('HMAC', ckey, input);
    return new Uint8Array(buffer);
  } else if (typeof process === 'object' && 'node' in process.versions) {
    const { createHmac } = require('crypto');
    const hash = createHmac('sha256', key);
    for (const message of messages) {
      hash.update(message);
    }
    return Uint8Array.from(hash.digest());
  } else {
    return hmacSha256Shim(key, ...messages);
  }
}

export function hmacSha256Shim(key: Uint8Array, ...messages: Uint8Array[]): Uint8Array {
  const input = messages.length === 1 ? messages[0] : concatByteArrays(messages);
  return new Hmac(new Sha256()).init(key).update(input).digest();
}
