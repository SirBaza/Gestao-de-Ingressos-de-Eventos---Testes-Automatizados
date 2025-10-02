import { IListarIngressosPorCompraUsecase } from "../../../contracts/ingresso/IUsecase";
import { IIngressoRepository } from "../../../contracts/ingresso/IRepository";
import { Ingresso } from "../../entities/Ingresso";

export class ListarIngressosPorCompraUseCase
  implements IListarIngressosPorCompraUsecase
{
  constructor(private repository: IIngressoRepository) {}

  async execute(data: { compraId: number }): Promise<Ingresso[]> {
    return this.repository.findByCompra(data.compraId);
  }
}
