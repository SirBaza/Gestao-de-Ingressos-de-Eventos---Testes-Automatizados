import { ComprarIngressoUseCase } from '../../domain/usecases/comprar-ingresso-usecase';
import { ComprarIngressoController } from '../../controllers/comprar-ingresso-controller';
import { SqliteCompraRepository } from '../../data/repositories/compra-repository';
import { SqliteIngressoRepository } from '../../data/repositories/ingresso-repository';
import { SqliteEventoRepository } from '../../data/repositories/evento-repository';
import { SqliteUsuarioRepository } from '../../data/repositories/usuario-repository';

export const makeComprarIngressoController = (): ComprarIngressoController => {
  const compraRepository = new SqliteCompraRepository();
  const ingressoRepository = new SqliteIngressoRepository();
  const eventoRepository = new SqliteEventoRepository();
  const usuarioRepository = new SqliteUsuarioRepository();
  
  const comprarIngressoUseCase = new ComprarIngressoUseCase(
    compraRepository,
    ingressoRepository,
    eventoRepository,
    usuarioRepository
  );
  
  return new ComprarIngressoController(comprarIngressoUseCase);
};
