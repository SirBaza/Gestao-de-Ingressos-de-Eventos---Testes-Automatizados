import { Evento } from "../models/interfaces";

export class EventoService {
  private eventos: Evento[] = [];
  private nextId = 1;

  criarEvento(evento: Omit<Evento, "id" | "criadoEm">): Evento {
    // Validar se a data não está no passado
    const agora = new Date();
    agora.setHours(0, 0, 0, 0);
    const dataEvento = new Date(evento.data);
    dataEvento.setHours(0, 0, 0, 0);

    if (dataEvento < agora) {
      throw new Error("Data do evento não pode ser no passado");
    }

    const novoEvento: Evento = {
      id: this.nextId++,
      ...evento,
      data: new Date(evento.data),
      criadoEm: new Date(),
    };

    this.eventos.push(novoEvento);
    return novoEvento;
  }

  buscarEventoPorId(id: number): Evento | undefined {
    return this.eventos.find((evento) => evento.id === id);
  }

  atualizarCapacidade(
    id: number,
    novaCapacidade: number,
    ingressosVendidos: number
  ): Evento {
    const evento = this.buscarEventoPorId(id);
    if (!evento) {
      throw new Error("Evento não encontrado");
    }

    if (novaCapacidade < ingressosVendidos) {
      throw new Error(
        "Não é possível reduzir a capacidade abaixo do número de ingressos já vendidos"
      );
    }

    evento.capacidadeTotal = novaCapacidade;
    return evento;
  }

  listarEventos(): Evento[] {
    return this.eventos;
  }
}
