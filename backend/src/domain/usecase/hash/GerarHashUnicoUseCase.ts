import { IGerarHashUnicoUsecase } from "../../../contracts/hash/IUsecase";
import { IHashRepository } from "../../../contracts/hash/IRepository";

export class GerarHashUnicoUseCase implements IGerarHashUnicoUsecase {
  constructor(private repository: IHashRepository) {}

  async execute(data: { payload: any; timestamp?: number }): Promise<string> {
    return this.repository.generateUniqueHash(data.payload);
  }
}
