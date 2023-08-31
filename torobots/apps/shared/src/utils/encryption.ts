// const crypto = require('crypto');
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const BLOCK_SIZE = 16;
const HMAC_SIZE = 32; // sha256 yields 32 bytes mac      

const DEFAULT_ENCKEY = "njuhbytdrsRTFGBHUYGFDrxtsesdftyu"
const DEFAULT_AUTHKEY = "JHBGVYFTCRDETrfdgvjyghkgbvygjhft"

export const encrypt = async (plainText: string, encKey = DEFAULT_ENCKEY, authKey = DEFAULT_AUTHKEY) => {
  const encrypted: any = await encryptText(plainText, encKey);
  const cipherBytes = Buffer.from(encrypted, "hex");

  const mac = crypto.createHmac("sha256", authKey).update(cipherBytes).digest();
  return Buffer.concat([mac, cipherBytes]).toString("hex");
}

// Encrypts plain text into cipher text
const encryptText = async (plainText: string, encryptionKey: string) => {
  const iv = crypto.randomBytes(BLOCK_SIZE);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  let cipherText;
  try {
    cipherText = cipher.update(plainText, "utf8", "hex");
    cipherText += cipher.final("hex");
    cipherText = iv.toString("hex") + cipherText;
  } catch (e) {
    // cipherText = null;
    console.log('!!!-encrption-encryptText-err');
    cipherText = plainText;
  }
  return cipherText;
}

export const decrypt = async (cipherText: string, encKey = DEFAULT_ENCKEY, authKey = DEFAULT_AUTHKEY)  => {
  const decoded = Buffer.from(cipherText, "hex");
  const tag = decoded.slice(0, HMAC_SIZE);
  const mac = crypto.createHmac("sha256", authKey).update(decoded.slice(HMAC_SIZE, decoded.length)).digest();
  // crypto-safe compare:  function is based on a constant-time algorithm.

  if (!crypto.timingSafeEqual(mac, tag)) {
    // throw new Error("hmac validation failed");
    console.log('!!!-encrption-decrypt-err');
    throw cipherText;
  }
  return await decryptText(decoded.slice(HMAC_SIZE, decoded.length).toString("hex"), encKey);
}

// Decrypts cipher text into plain text
const decryptText = async (cipherText: string, encryptionKey: string) => {
  try {
    const contents = Buffer.from(cipherText, "hex");
    const iv = contents.slice(0, BLOCK_SIZE);
    const textBytes = contents.slice(BLOCK_SIZE);

    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
    let decrypted = decipher.update(textBytes as any, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    // throw new Error("decryption failed");
    console.log('!!!-encrption-decryptText-err');
    throw cipherText;
  }
}