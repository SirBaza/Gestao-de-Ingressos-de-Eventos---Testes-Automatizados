import { IUsecase } from "../IUsecase";
import { Evento } from "../../domain/entities/Evento";

export interface ICriarEventoUsecase
  extends IUsecase<Omit<Evento, "id" | "criadoEm">, Evento> {}

export interface IListarEventosUsecase
  extends IUsecase<{ data?: Date; local?: string }, Evento[]> {}

export interface IAtualizarCapacidadeUsecase
  extends IUsecase<
    { eventoId: number; novaCapacidade: number; ingressosVendidos: number },
    Evento
  > {}

export interface IVerificarDisponibilidadeUsecase
  extends IUsecase<
    { eventoId: number; quantidadeRequerida: number },
    { disponivel: boolean; capacidadeRestante: number }
  > {}
