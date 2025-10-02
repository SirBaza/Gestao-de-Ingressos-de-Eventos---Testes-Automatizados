import { EventoController } from "../../controllers/EventoController";
import {
  CriarEventoUseCase,
  ListarEventosUseCase,
  AtualizarCapacidadeUseCase,
  VerificarDisponibilidadeUseCase,
} from "../../domain/usecase/evento";
import { EventoRepository } from "../../repositories/EventoRepository";

export function factoryEvento() {
  const repository = new EventoRepository();
  const criarEventoUseCase = new CriarEventoUseCase(repository);
  const listarEventosUseCase = new ListarEventosUseCase(repository);
  const atualizarCapacidadeUseCase = new AtualizarCapacidadeUseCase(repository);
  const verificarDisponibilidadeUseCase = new VerificarDisponibilidadeUseCase(
    repository
  );
  const controller = new EventoController(
    criarEventoUseCase,
    listarEventosUseCase,
    atualizarCapacidadeUseCase,
    verificarDisponibilidadeUseCase
  );
  return controller;
}
