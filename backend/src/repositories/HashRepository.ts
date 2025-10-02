import { IHashRepository } from "../contracts/hash/IRepository";
import crypto from "crypto";

export class HashRepository implements IHashRepository {
  async generateHash(payload: any): Promise<string> {
    const data = JSON.stringify(payload);
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  async validateHash(payload: any, expectedHash: string): Promise<boolean> {
    const generatedHash = await this.generateHash(payload);
    return generatedHash === expectedHash;
  }

  async generateUniqueHash(payload: any): Promise<string> {
    const dataWithTimestamp = {
      ...payload,
      timestamp: Date.now(),
      random: Math.random(),
    };
    return this.generateHash(dataWithTimestamp);
  }
}
