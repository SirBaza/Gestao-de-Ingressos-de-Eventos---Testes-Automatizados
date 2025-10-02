import { IGerarHashUsecase } from "../../../contracts/hash/IUsecase";
import { IHashRepository } from "../../../contracts/hash/IRepository";

export class GerarHashUseCase implements IGerarHashUsecase {
  constructor(private repository: IHashRepository) {}

  async execute(data: { payload: any }): Promise<string> {
    return this.repository.generateHash(data.payload);
  }
}
