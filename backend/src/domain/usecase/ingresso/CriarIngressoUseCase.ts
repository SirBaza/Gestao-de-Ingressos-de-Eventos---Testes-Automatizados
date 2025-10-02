import { ICriarIngressoUsecase } from "../../../contracts/ingresso/IUsecase";
import { IIngressoRepository } from "../../../contracts/ingresso/IRepository";
import { IHashRepository } from "../../../contracts/hash/IRepository";
import { Ingresso } from "../../entities/Ingresso";

export class CriarIngressoUseCase implements ICriarIngressoUsecase {
  constructor(
    private ingressoRepository: IIngressoRepository,
    private hashRepository: IHashRepository
  ) {}

  async execute(data: { compraId: number; payload: any }): Promise<Ingresso> {
    const hash = await this.hashRepository.generateHash(data.payload);

    return this.ingressoRepository.insert({
      compraId: data.compraId,
      hash,
      usado: false,
    });
  }
}
