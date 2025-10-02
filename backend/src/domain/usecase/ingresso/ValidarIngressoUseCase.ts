import { IValidarIngressoUsecase } from "../../../contracts/ingresso/IUsecase";
import { IIngressoRepository } from "../../../contracts/ingresso/IRepository";
import { Ingresso } from "../../entities/Ingresso";

export class ValidarIngressoUseCase implements IValidarIngressoUsecase {
  constructor(private repository: IIngressoRepository) {}

  async execute(data: {
    hash: string;
  }): Promise<{ valido: boolean; mensagem: string; ingresso?: Ingresso }> {
    const ingresso = await this.repository.findByHash(data.hash);

    if (!ingresso) {
      return { valido: false, mensagem: "Ingresso não encontrado" };
    }

    if (ingresso.usado) {
      return {
        valido: false,
        mensagem: "Ingresso já utilizado",
        ingresso,
      };
    }

    const ingressoAtualizado = await this.repository.markAsUsed(ingresso.id!);

    return {
      valido: true,
      mensagem: "Ingresso válido e marcado como usado",
      ingresso: ingressoAtualizado || ingresso,
    };
  }
}
