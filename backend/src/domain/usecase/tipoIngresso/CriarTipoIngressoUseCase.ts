import { ICriarTipoIngressoUsecase } from "../../../contracts/tipoIngresso/IUsecase";
import { ITipoIngressoRepository } from "../../../contracts/tipoIngresso/IRepository";
import { TipoIngresso } from "../../entities/TipoIngresso";

export class CriarTipoIngressoUseCase implements ICriarTipoIngressoUsecase {
  constructor(private repository: ITipoIngressoRepository) {}

  async execute(
    data: Omit<TipoIngresso, "id" | "criadoEm" | "quantidadeDisponivel">
  ): Promise<TipoIngresso> {
    return this.repository.insert({
      ...data,
      quantidadeDisponivel: data.quantidadeInicial,
    });
  }
}
