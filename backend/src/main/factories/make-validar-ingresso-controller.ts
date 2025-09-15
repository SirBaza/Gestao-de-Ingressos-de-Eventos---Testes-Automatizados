import { ValidarIngressoUseCase } from '../../domain/usecases/validar-ingresso-usecase';
import { ValidarIngressoController } from '../../controllers/validar-ingresso-controller';
import { SqliteCompraRepository } from '../../data/repositories/compra-repository';
import { SqliteEventoRepository } from '../../data/repositories/evento-repository';

export const makeValidarIngressoController = (): ValidarIngressoController => {
  const compraRepository = new SqliteCompraRepository();
  const eventoRepository = new SqliteEventoRepository();
  
  const validarIngressoUseCase = new ValidarIngressoUseCase(
    compraRepository,
    eventoRepository
  );
  
  return new ValidarIngressoController(validarIngressoUseCase);
};
