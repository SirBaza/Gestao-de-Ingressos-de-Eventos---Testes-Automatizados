import { CriarEventoUseCase } from '../../domain/usecases/criar-evento-usecase';
import { CriarEventoController } from '../../controllers/criar-evento-controller';
import { SqliteEventoRepository } from '../../data/repositories/evento-repository';

export const makeCriarEventoController = (): CriarEventoController => {
  const eventoRepository = new SqliteEventoRepository();
  const criarEventoUseCase = new CriarEventoUseCase(eventoRepository);
  return new CriarEventoController(criarEventoUseCase);
};
