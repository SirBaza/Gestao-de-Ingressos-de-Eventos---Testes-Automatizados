import { IVerificarDisponibilidadeTipoIngressoUsecase } from "../../../contracts/tipoIngresso/IUsecase";
import { ITipoIngressoRepository } from "../../../contracts/tipoIngresso/IRepository";

export class VerificarDisponibilidadeTipoIngressoUseCase
  implements IVerificarDisponibilidadeTipoIngressoUsecase
{
  constructor(private repository: ITipoIngressoRepository) {}

  async execute(data: {
    tipoIngressoId: number;
    quantidade: number;
  }): Promise<{ disponivel: boolean; quantidadeDisponivel: number }> {
    const tipoIngresso = await this.repository.findById(data.tipoIngressoId);

    if (!tipoIngresso) {
      return { disponivel: false, quantidadeDisponivel: 0 };
    }

    const disponivel = await this.repository.checkAvailability(
      data.tipoIngressoId,
      data.quantidade
    );

    return {
      disponivel,
      quantidadeDisponivel: tipoIngresso.quantidadeDisponivel,
    };
  }
}
