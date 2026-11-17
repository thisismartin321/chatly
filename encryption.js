// End-to-End-Verschlüsselung für Nachrichten und Dateien
// Verwendung: node- kryptographie mit RSA für Schlüssel und AES für Nachrichten

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  // Generiere einen RSA-Schlüssel für den Benutzer
  static generateKeyPair() {
    const { webcrypto } = require('crypto');
    const keyPair = webcrypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: [1, 0, 1], hash: 'SHA-256' },
      true,
      ['encrypt', 'decrypt']
    );
    return keyPair;
  }

  // Konvertiere Schlüssel in Dateien oder Exporte/Importe in Speicher
  static exportPublicKey(key) {
    const { webcrypto } = require('crypto');
    return webcrypto.subtle.exportKey('spki', key);
  }

  // Verschlüssle Text mit Benutzerschlüssel
  async encryptMessage(text, recipientPublicKey) {
    const { webcrypto } = require('crypto');
    const encodedText = new TextEncoder().encode(text);
    const encryptedContent = await webcrypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      encodedText
    );
    return Array.from(new Uint8Array(encryptedContent));
  }

  // Verschlüssle Dateien mit symmetrischer AES-Verschlüsselung
  async encryptFile(fileBuffer, recipientPublicKey) {
    const key = crypto.randomBytes(this.keyLength);
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);

    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);

    const tag = cipher.getAuthTag();

    // Verschlüssle den symmetrischen Schlüssel mit RSA
    const { webcrypto } = require('crypto');
    const encryptedKey = await webcrypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      key
    );

    return {
      encryptedContent: encrypted,
      encryptedKey: Array.from(new Uint8Array(encryptedKey)),
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Verschlüssle eine Datei in einem sicheren Verzeichnis
  async saveEncryptedFile(encryptedData, filename) {
    const encryptedDir = path.join(__dirname, 'secure_files');
    if (!fs.existsSync(encryptedDir)) {
      fs.mkdirSync(encryptedDir, { recursive: true });
    }

    const filePath = path.join(encryptedDir, `${filename}.${Date.now()}`);
    fs.writeFileSync(filePath, JSON.stringify(encryptedData));
    return filePath;
  }

  // Hole Benutzerschlüssel aus der Datenbank
  static async getUserPublicKey(db, userId) {
    const user = db.prepare('SELECT public_key FROM users WHERE id = ?').get(userId);
    if (!user || !user.public_key) {
      throw new Error('Kein öffentlicher Schlüssel für den Benutzer gefunden');
    }
    return user.public_key;
  }

  // Füge einen öffentlichen Schlüssel zum Benutzer hinzu
  static addUserPublicKey(db, userId, publicKey) {
    db.prepare('UPDATE users SET public_key = ? WHERE id = ?').run(publicKey, userId);
  }

  // Generiere einen Benutzerschlüsselpaar und speichere ihn in der Datenbank
  static async generateAndStoreKeyPair(db, userId) {
    const { webcrypto } = require('crypto');
    const keyPair = await webcrypto.subtle.generateKey(
      { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: [1, 0, 1], hash: 'SHA-256' },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKey = await webcrypto.subtle.exportKey('spki', keyPair);
    const publicKeyStr = Buffer.from(publicKey).toString('base64');

    this.addUserPublicKey(db, userId, publicKeyStr);

    return {
      privateKey: keyPair,
      publicKey: publicKeyStr
    };
  }
}

module.exports = EncryptionService;