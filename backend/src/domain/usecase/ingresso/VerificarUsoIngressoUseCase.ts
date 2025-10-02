import { IVerificarUsoIngressoUsecase } from "../../../contracts/ingresso/IUsecase";
import { IIngressoRepository } from "../../../contracts/ingresso/IRepository";

export class VerificarUsoIngressoUseCase
  implements IVerificarUsoIngressoUsecase
{
  constructor(private repository: IIngressoRepository) {}

  async execute(data: {
    hash: string;
  }): Promise<{ usado: boolean; dataUso?: Date }> {
    const ingresso = await this.repository.findByHash(data.hash);

    if (!ingresso) {
      return { usado: false };
    }

    return {
      usado: ingresso.usado,
      dataUso: ingresso.dataUso,
    };
  }
}
