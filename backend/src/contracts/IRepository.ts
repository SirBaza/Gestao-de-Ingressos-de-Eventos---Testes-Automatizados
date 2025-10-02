export interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  insert(obj: Omit<T, "id" | "criadoEm">): Promise<T>;
  update(id: number, obj: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}
