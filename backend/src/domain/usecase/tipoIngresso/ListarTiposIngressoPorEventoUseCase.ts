import { IListarTiposIngressoPorEventoUsecase } from "../../../contracts/tipoIngresso/IUsecase";
import { ITipoIngressoRepository } from "../../../contracts/tipoIngresso/IRepository";
import { TipoIngresso } from "../../entities/TipoIngresso";

export class ListarTiposIngressoPorEventoUseCase
  implements IListarTiposIngressoPorEventoUsecase
{
  constructor(private repository: ITipoIngressoRepository) {}

  async execute(data: { eventoId: number }): Promise<TipoIngresso[]> {
    return this.repository.findByEvento(data.eventoId);
  }
}
