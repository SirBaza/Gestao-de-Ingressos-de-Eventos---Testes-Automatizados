import { IListarEventosUsecase } from "../../../contracts/evento/IUsecase";
import { IEventoRepository } from "../../../contracts/evento/IRepository";
import { Evento } from "../../entities/Evento";

export class ListarEventosUseCase implements IListarEventosUsecase {
  constructor(private repository: IEventoRepository) {}

  async execute(data: { data?: Date; local?: string }): Promise<Evento[]> {
    if (data.data) {
      return this.repository.findByDate(data.data);
    }

    if (data.local) {
      return this.repository.findByLocal(data.local);
    }

    return this.repository.findAll();
  }
}
