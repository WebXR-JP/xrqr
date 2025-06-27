import CryptoJS from 'crypto-js'

/**
 * パスワードベースでテキストを暗号化する
 * PBKDF2 + AES を使用
 */
export const encryptText = (text: string, password: string): string => {
  try {
    // パスワードから暗号化キーを生成（PBKDF2）
    const salt = CryptoJS.lib.WordArray.random(128 / 8)
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000
    })
    
    // IV（初期化ベクトル）を生成
    const iv = CryptoJS.lib.WordArray.random(128 / 8)
    
    // AESで暗号化
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    // salt + iv + 暗号化データを連結してBase64エンコード
    const result = salt.concat(iv).concat(encrypted.ciphertext)
    return CryptoJS.enc.Base64.stringify(result)
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('暗号化に失敗しました')
  }
}

/**
 * パスワードベースで暗号化されたテキストを復号化する
 */
export const decryptText = (encryptedText: string, password: string): string => {
  try {
    // Base64デコード
    const cipherParams = CryptoJS.enc.Base64.parse(encryptedText)
    
    // salt（128bit）とiv（128bit）を抽出
    const salt = CryptoJS.lib.WordArray.create(cipherParams.words.slice(0, 4))
    const iv = CryptoJS.lib.WordArray.create(cipherParams.words.slice(4, 8))
    const encrypted = CryptoJS.lib.WordArray.create(cipherParams.words.slice(8))
    
    // パスワードからキーを再生成
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 1000
    })
    
    // 復号化
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted } as any,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedText) {
      throw new Error('復号化に失敗しました（パスワードが間違っている可能性があります）')
    }
    
    return decryptedText
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('復号化に失敗しました（パスワードが間違っている可能性があります）')
  }
}