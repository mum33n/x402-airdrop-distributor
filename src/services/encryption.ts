import crypto, { type CipherGCMTypes } from "crypto";

class Encryption {
  private masterKey: Buffer<ArrayBuffer>;
  readonly algorithm: CipherGCMTypes;

  constructor() {
    this.masterKey = crypto.scryptSync(
      process.env.ENCRYPTION_MASTER_KEY!, // password
      "airdrop-salt", // salt (constant)
      32 // key length
    );
    this.algorithm = "aes-256-gcm";
  }

  encrypt(plain: string) {
    const iv = crypto.randomBytes(12);
    console.log(process.env.ENCRYPTION_MASTER_KEY, this.masterKey);
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plain, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return {
      encryptedKey: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
    };
  }

  decrypt(encryptedKey: string, iv: string, tag: string) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.masterKey,
      Buffer.from(iv, "base64")
    );

    decipher.setAuthTag(Buffer.from(tag, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedKey, "base64")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }
}

export const encryptionService = new Encryption();
