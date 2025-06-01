import CryptoJS from 'crypto-js';
import { EncryptedPayload } from '../types';

export class EncryptionService {
  private static generateKey(pin: string): string {
    return CryptoJS.SHA256(pin).toString();
  }

  static encrypt(content: string, pin: string, isSecret: boolean): string {
    const key = this.generateKey(pin);
    const payload: EncryptedPayload = {
      content,
      isSecret,
      timestamp: new Date().toISOString()
    };

    const jsonString = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encrypted;
  }

  static decrypt(encrypted: string, pin: string): EncryptedPayload {
    try {
      const key = this.generateKey(pin);
      const decrypted = CryptoJS.AES.decrypt(encrypted, key);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

      if (!jsonString) {
        throw new Error('復号化に失敗しました');
      }

      const payload = JSON.parse(jsonString) as EncryptedPayload;
      return payload;
    } catch (error) {
      throw new Error('キーが一致しません');
    }
  }
}
