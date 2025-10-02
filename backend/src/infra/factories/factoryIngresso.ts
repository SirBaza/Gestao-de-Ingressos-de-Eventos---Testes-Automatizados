import { IngressoController } from "../../controllers/IngressoController";
import {
  CriarIngressoUseCase,
  ListarIngressosPorCompraUseCase,
  ValidarIngressoUseCase,
  VerificarUsoIngressoUseCase,
} from "../../domain/usecase/ingresso";
import { IngressoRepository } from "../../repositories/IngressoRepository";
import { HashRepository } from "../../repositories/HashRepository";

export function factoryIngresso() {
  const ingressoRepository = new IngressoRepository();
  const hashRepository = new HashRepository();
  const criarIngressoUseCase = new CriarIngressoUseCase(
    ingressoRepository,
    hashRepository
  );
  const listarIngressosPorCompraUseCase = new ListarIngressosPorCompraUseCase(
    ingressoRepository
  );
  const validarIngressoUseCase = new ValidarIngressoUseCase(ingressoRepository);
  const verificarUsoIngressoUseCase = new VerificarUsoIngressoUseCase(
    ingressoRepository
  );
  const controller = new IngressoController(
    criarIngressoUseCase,
    listarIngressosPorCompraUseCase,
    validarIngressoUseCase,
    verificarUsoIngressoUseCase
  );
  return controller;
}
