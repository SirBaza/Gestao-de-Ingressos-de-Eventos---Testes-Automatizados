import { IRepository } from "../IRepository";
import { TipoIngresso } from "../../domain/entities/TipoIngresso";

export interface ITipoIngressoRepository extends IRepository<TipoIngresso> {
  findByEvento(eventoId: number): Promise<TipoIngresso[]>;
  checkAvailability(id: number, quantidade: number): Promise<boolean>;
  reduceStock(id: number, quantidade: number): Promise<TipoIngresso | null>;
  restoreStock(id: number, quantidade: number): Promise<TipoIngresso | null>;
}
