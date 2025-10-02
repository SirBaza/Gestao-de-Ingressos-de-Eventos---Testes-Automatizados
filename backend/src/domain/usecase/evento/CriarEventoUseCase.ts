import { ICriarEventoUsecase } from "../../../contracts/evento/IUsecase";
import { IEventoRepository } from "../../../contracts/evento/IRepository";
import { Evento } from "../../entities/Evento";

export class CriarEventoUseCase implements ICriarEventoUsecase {
  constructor(private repository: IEventoRepository) {}

  async execute(data: Omit<Evento, "id" | "criadoEm">): Promise<Evento> {
    return this.repository.insert(data);
  }
}
