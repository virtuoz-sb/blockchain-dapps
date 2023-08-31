import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export default class CipherService {
  private ALGORITHM = "aes-256-cbc";

  private BLOCK_SIZE = 16;

  private HMAC_SIZE = 32; // sha256 yields 32 bytes mac

  // Decrypts cipher text into plain text
  decrypt(cipherText, encryptionKey: string): string {
    try {
      const contents = Buffer.from(cipherText, "hex");
      const iv = contents.slice(0, this.BLOCK_SIZE);
      const textBytes = contents.slice(this.BLOCK_SIZE);

      const decipher = crypto.createDecipheriv(this.ALGORITHM, encryptionKey, iv);
      let decrypted = decipher.update(textBytes, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (e) {
      throw new Error("decryption failed");
    }
  }

  decryptWithHmac(cipherText, encKey, authKey: string): string {
    const decoded = Buffer.from(cipherText, "hex");
    const tag = decoded.slice(0, this.HMAC_SIZE);

    const mac = crypto.createHmac("sha256", authKey).update(decoded.slice(this.HMAC_SIZE, decoded.length)).digest();
    // crypto-safe compare:  function is based on a constant-time algorithm.
    if (!crypto.timingSafeEqual(mac, tag)) {
      throw new Error("hmac validation failed");
    }
    return this.decrypt(decoded.slice(this.HMAC_SIZE, decoded.length).toString("hex"), encKey);
  }

  encryptWithHmac(plainText, encKey, authKey: string): string {
    const encrypted = this.encrypt(plainText, encKey);
    const cipherBytes = Buffer.from(encrypted, "hex");

    const mac = crypto.createHmac("sha256", authKey).update(cipherBytes).digest();
    return Buffer.concat([mac, cipherBytes]).toString("hex");
  }

  // Encrypts plain text into cipher text
  encrypt(plainText, encryptionKey: string): string {
    const iv = crypto.randomBytes(this.BLOCK_SIZE);
    const cipher = crypto.createCipheriv(this.ALGORITHM, encryptionKey, iv);
    let cipherText;
    try {
      cipherText = cipher.update(plainText, "utf8", "hex");
      cipherText += cipher.final("hex");
      cipherText = iv.toString("hex") + cipherText;
    } catch (e) {
      cipherText = null;
    }
    return cipherText;
  }
}
