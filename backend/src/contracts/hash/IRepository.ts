export interface IHashRepository {
  generateHash(payload: any): Promise<string>;
  validateHash(payload: any, expectedHash: string): Promise<boolean>;
  generateUniqueHash(payload: any): Promise<string>;
}
