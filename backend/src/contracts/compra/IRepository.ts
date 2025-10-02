import { IRepository } from "../IRepository";
import { Compra } from "../../domain/entities/Compra";

export interface ICompraRepository extends IRepository<Compra> {
  findByEvento(eventoId: number): Promise<Compra[]>;
  findByEmail(email: string): Promise<Compra[]>;
  calculateTotalTicketsSold(eventoId: number): Promise<number>;
  calculateTotalRevenue(eventoId: number): Promise<number>;
}
