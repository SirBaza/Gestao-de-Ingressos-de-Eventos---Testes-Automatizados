import { IRepository } from "../IRepository";
import { Ingresso } from "../../domain/entities/Ingresso";

/**
 * Interface específica para o repositório de Ingresso
 * Estende IRepository e adiciona métodos específicos de ingressos
 */
export interface IIngressoRepository extends IRepository<Ingresso> {
  findByHash(hash: string): Promise<Ingresso | null>;
  findByCompra(compraId: number): Promise<Ingresso[]>;
  markAsUsed(id: number): Promise<Ingresso | null>;
  checkIfUsed(hash: string): Promise<boolean>;
}
