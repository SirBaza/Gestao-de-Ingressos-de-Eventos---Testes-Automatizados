import { ListarEventosUseCase } from '../../domain/usecases/listar-eventos-usecase';
import { ListarEventosController } from '../../controllers/listar-eventos-controller';
import { SqliteEventoRepository } from '../../data/repositories/evento-repository';

export const makeListarEventosController = (): ListarEventosController => {
  const eventoRepository = new SqliteEventoRepository();
  const listarEventosUseCase = new ListarEventosUseCase(eventoRepository);
  return new ListarEventosController(listarEventosUseCase);
};
