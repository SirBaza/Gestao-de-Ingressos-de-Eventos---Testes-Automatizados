import { IValidarHashUsecase } from "../../../contracts/hash/IUsecase";
import { IHashRepository } from "../../../contracts/hash/IRepository";

export class ValidarHashUseCase implements IValidarHashUsecase {
  constructor(private repository: IHashRepository) {}

  async execute(data: {
    payload: any;
    hashEsperado: string;
  }): Promise<boolean> {
    return this.repository.validateHash(data.payload, data.hashEsperado);
  }
}
