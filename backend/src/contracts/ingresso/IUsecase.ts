import { IUsecase } from "../IUsecase";
import { Ingresso } from "../../domain/entities/Ingresso";

/**
 * Caso de uso para criar um ingresso
 */
export interface ICriarIngressoUsecase
  extends IUsecase<{ compraId: number; payload: any }, Ingresso> {}

/**
 * Caso de uso para validar um ingresso
 */
export interface IValidarIngressoUsecase
  extends IUsecase<
    { hash: string },
    { valido: boolean; mensagem: string; ingresso?: Ingresso }
  > {}

/**
 * Caso de uso para listar ingressos por compra
 */
export interface IListarIngressosPorCompraUsecase
  extends IUsecase<{ compraId: number }, Ingresso[]> {}

/**
 * Caso de uso para verificar se ingresso foi usado
 */
export interface IVerificarUsoIngressoUsecase
  extends IUsecase<{ hash: string }, { usado: boolean; dataUso?: Date }> {}
