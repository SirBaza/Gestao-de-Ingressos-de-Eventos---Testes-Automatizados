/**
 * Interface genérica para repositórios
 * Define operações CRUD básicas que podem ser implementadas por qualquer repositório
 * @template T - Tipo da entidade que o repositório gerencia
 */
export interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  insert(obj: Omit<T, "id" | "criadoEm">): Promise<T>;
  update(id: number, obj: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}
