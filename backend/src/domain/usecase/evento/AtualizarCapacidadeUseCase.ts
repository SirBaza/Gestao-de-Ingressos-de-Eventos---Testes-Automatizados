import { IAtualizarCapacidadeUsecase } from "../../../contracts/evento/IUsecase";
import { IEventoRepository } from "../../../contracts/evento/IRepository";
import { Evento } from "../../entities/Evento";

export class AtualizarCapacidadeUseCase implements IAtualizarCapacidadeUsecase {
  constructor(private repository: IEventoRepository) {}

  async execute(data: {
    eventoId: number;
    novaCapacidade: number;
    ingressosVendidos: number;
  }): Promise<Evento> {
    const evento = await this.repository.findById(data.eventoId);

    if (!evento) {
      throw new Error("Evento não encontrado");
    }

    if (data.novaCapacidade < data.ingressosVendidos) {
      throw new Error(
        "Não é possível reduzir a capacidade abaixo do número de ingressos já vendidos"
      );
    }

    const eventoAtualizado = await this.repository.updateCapacity(
      data.eventoId,
      data.novaCapacidade
    );

    if (!eventoAtualizado) {
      throw new Error("Erro ao atualizar capacidade");
    }

    return eventoAtualizado;
  }
}
