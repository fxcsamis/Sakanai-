// Copyright (c) 2026 Raj
// See LICENSE for details.

import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

// Real SHA-256 hashing for the PIN (never store the PIN itself).
export async function hashPin(pin: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

// Real AES-256 encryption/decryption (crypto-js) for vault file contents.
// Files are read/written as base64 strings via expo-file-system; the key never
// leaves the device (derived from the user's PIN, not stored anywhere).
export function encryptBase64(base64Data: string, key: string): string {
    return CryptoJS.AES.encrypt(base64Data, key).toString();
}

export function decryptToBase64(cipherText: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}
