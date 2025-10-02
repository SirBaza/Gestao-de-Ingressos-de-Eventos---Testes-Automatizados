import { IVerificarDisponibilidadeUsecase } from "../../../contracts/evento/IUsecase";
import { IEventoRepository } from "../../../contracts/evento/IRepository";

export class VerificarDisponibilidadeUseCase
  implements IVerificarDisponibilidadeUsecase
{
  constructor(private repository: IEventoRepository) {}

  async execute(data: {
    eventoId: number;
    quantidadeRequerida: number;
  }): Promise<{ disponivel: boolean; capacidadeRestante: number }> {
    const evento = await this.repository.findById(data.eventoId);

    if (!evento) {
      return { disponivel: false, capacidadeRestante: 0 };
    }

    const disponivel = await this.repository.checkAvailability(
      data.eventoId,
      data.quantidadeRequerida
    );

    return {
      disponivel,
      capacidadeRestante: evento.capacidadeTotal,
    };
  }
}
