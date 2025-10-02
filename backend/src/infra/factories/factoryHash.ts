import { HashController } from "../../controllers/HashController";
import {
  GerarHashUseCase,
  ValidarHashUseCase,
  GerarHashUnicoUseCase,
} from "../../domain/usecase/hash";
import { HashRepository } from "../../repositories/HashRepository";

export function factoryHash() {
  const repository = new HashRepository();
  const gerarHashUseCase = new GerarHashUseCase(repository);
  const validarHashUseCase = new ValidarHashUseCase(repository);
  const gerarHashUnicoUseCase = new GerarHashUnicoUseCase(repository);
  const controller = new HashController(
    gerarHashUseCase,
    validarHashUseCase,
    gerarHashUnicoUseCase
  );
  return controller;
}
