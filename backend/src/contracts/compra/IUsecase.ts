import { IUsecase } from "../IUsecase";
import { Compra } from "../../domain/entities/Compra";

export interface ICriarCompraUsecase
  extends IUsecase<Omit<Compra, "id" | "criadoEm">, Compra> {}

export interface IListarComprasUsecase
  extends IUsecase<{ eventoId?: number; email?: string }, Compra[]> {}

export interface ICalcularTotalUsecase
  extends IUsecase<
    { eventoId: number },
    { totalIngressos: number; receita: number }
  > {}
