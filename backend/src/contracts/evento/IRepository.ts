import { IRepository } from "../IRepository";
import { Evento } from "../../domain/entities/Evento";

/**
 * Interface específica para o repositório de Evento
 * Estende IRepository e adiciona métodos específicos de eventos
 */
export interface IEventoRepository extends IRepository<Evento> {
  findByDate(data: Date): Promise<Evento[]>;
  findByLocal(local: string): Promise<Evento[]>;
  updateCapacity(id: number, novaCapacidade: number): Promise<Evento | null>;
  checkAvailability(id: number, quantidadeRequerida: number): Promise<boolean>;
}
