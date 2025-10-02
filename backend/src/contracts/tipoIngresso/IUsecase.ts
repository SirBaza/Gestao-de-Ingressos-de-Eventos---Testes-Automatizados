import { IUsecase } from "../IUsecase";
import { TipoIngresso } from "../../domain/entities/TipoIngresso";

export interface ICriarTipoIngressoUsecase
  extends IUsecase<
    Omit<TipoIngresso, "id" | "criadoEm" | "quantidadeDisponivel">,
    TipoIngresso
  > {}

export interface IListarTiposIngressoPorEventoUsecase
  extends IUsecase<{ eventoId: number }, TipoIngresso[]> {}

export interface IVerificarDisponibilidadeTipoIngressoUsecase
  extends IUsecase<
    { tipoIngressoId: number; quantidade: number },
    { disponivel: boolean; quantidadeDisponivel: number }
  > {}

export interface IReduzirEstoqueTipoIngressoUsecase
  extends IUsecase<
    { tipoIngressoId: number; quantidade: number },
    TipoIngresso
  > {}
