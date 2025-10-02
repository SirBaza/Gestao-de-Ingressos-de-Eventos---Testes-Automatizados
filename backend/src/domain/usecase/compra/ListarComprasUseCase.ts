import { IListarComprasUsecase } from "../../../contracts/compra/IUsecase";
import { ICompraRepository } from "../../../contracts/compra/IRepository";
import { Compra } from "../../entities/Compra";

export class ListarComprasUseCase implements IListarComprasUsecase {
  constructor(private repository: ICompraRepository) {}

  async execute(data: {
    eventoId?: number;
    email?: string;
  }): Promise<Compra[]> {
    if (data.eventoId) {
      return this.repository.findByEvento(data.eventoId);
    }

    if (data.email) {
      return this.repository.findByEmail(data.email);
    }

    return this.repository.findAll();
  }
}
