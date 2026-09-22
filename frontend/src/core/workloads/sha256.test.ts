import { describe, it, expect } from 'vitest';
import { sha256JS, generateSha256Input } from './sha256';

// Helper to convert Uint8Array to hex for easier visual comparison
function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('sha256JS', () => {
  it('computes correct SHA-256 for an empty message', () => {
    const input = new Uint8Array(0);
    const digest = sha256JS(input);
    expect(toHex(digest)).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('computes correct SHA-256 for "abc"', () => {
    const input = new TextEncoder().encode('abc');
    const digest = sha256JS(input);
    expect(toHex(digest)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('computes correct SHA-256 for a longer standard test vector', () => {
    const input = new TextEncoder().encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq');
    const digest = sha256JS(input);
    expect(toHex(digest)).toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1');
  });

  it('computes deterministically generated inputs', () => {
    const input = generateSha256Input(100);
    expect(input.length).toBe(100);
    const digest = sha256JS(input);
    expect(digest.length).toBe(32);
    // Since input is deterministic, the hash should also be deterministic
    const expectedHex = toHex(digest); // Just proving it doesn't crash and returns 32 bytes
    expect(expectedHex.length).toBe(64);
  });
});
