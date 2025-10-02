import { ICalcularTotalUsecase } from "../../../contracts/compra/IUsecase";
import { ICompraRepository } from "../../../contracts/compra/IRepository";

export class CalcularTotalUseCase implements ICalcularTotalUsecase {
  constructor(private repository: ICompraRepository) {}

  async execute(data: {
    eventoId: number;
  }): Promise<{ totalIngressos: number; receita: number }> {
    const totalIngressos = await this.repository.calculateTotalTicketsSold(
      data.eventoId
    );
    const receita = await this.repository.calculateTotalRevenue(data.eventoId);

    return {
      totalIngressos,
      receita,
    };
  }
}
