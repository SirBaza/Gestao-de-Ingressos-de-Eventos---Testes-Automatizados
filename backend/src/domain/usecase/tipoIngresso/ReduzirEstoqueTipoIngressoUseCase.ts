import { IReduzirEstoqueTipoIngressoUsecase } from "../../../contracts/tipoIngresso/IUsecase";
import { ITipoIngressoRepository } from "../../../contracts/tipoIngresso/IRepository";
import { TipoIngresso } from "../../entities/TipoIngresso";

export class ReduzirEstoqueTipoIngressoUseCase
  implements IReduzirEstoqueTipoIngressoUsecase
{
  constructor(private repository: ITipoIngressoRepository) {}

  async execute(data: {
    tipoIngressoId: number;
    quantidade: number;
  }): Promise<TipoIngresso> {
    const tipoIngresso = await this.repository.findById(data.tipoIngressoId);

    if (!tipoIngresso) {
      throw new Error("Tipo de ingresso não encontrado");
    }

    if (tipoIngresso.quantidadeDisponivel === 0) {
      throw new Error("Ingressos esgotados");
    }

    if (tipoIngresso.quantidadeDisponivel < data.quantidade) {
      throw new Error("Quantidade solicitada maior que a disponível");
    }

    const resultado = await this.repository.reduceStock(
      data.tipoIngressoId,
      data.quantidade
    );

    if (!resultado) {
      throw new Error("Erro ao reduzir estoque");
    }

    return resultado;
  }
}
