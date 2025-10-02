import { ICriarCompraUsecase } from "../../../contracts/compra/IUsecase";
import { ICompraRepository } from "../../../contracts/compra/IRepository";
import { Compra } from "../../entities/Compra";

export class CriarCompraUseCase implements ICriarCompraUsecase {
  constructor(private repository: ICompraRepository) {}

  async execute(data: Omit<Compra, "id" | "criadoEm">): Promise<Compra> {
    return this.repository.insert(data);
  }
}
