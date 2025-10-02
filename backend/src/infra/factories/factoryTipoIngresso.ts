import { TipoIngressoController } from "../../controllers/TipoIngressoController";
import {
  CriarTipoIngressoUseCase,
  ListarTiposIngressoPorEventoUseCase,
  VerificarDisponibilidadeTipoIngressoUseCase,
  ReduzirEstoqueTipoIngressoUseCase,
} from "../../domain/usecase/tipoIngresso";
import { TipoIngressoRepository } from "../../repositories/TipoIngressoRepository";

export function factoryTipoIngresso() {
  const repository = new TipoIngressoRepository();
  const criarTipoIngressoUseCase = new CriarTipoIngressoUseCase(repository);
  const listarTiposIngressoPorEventoUseCase =
    new ListarTiposIngressoPorEventoUseCase(repository);
  const verificarDisponibilidadeTipoIngressoUseCase =
    new VerificarDisponibilidadeTipoIngressoUseCase(repository);
  const reduzirEstoqueTipoIngressoUseCase =
    new ReduzirEstoqueTipoIngressoUseCase(repository);
  const controller = new TipoIngressoController(
    criarTipoIngressoUseCase,
    listarTiposIngressoPorEventoUseCase,
    verificarDisponibilidadeTipoIngressoUseCase,
    reduzirEstoqueTipoIngressoUseCase
  );
  return controller;
}
