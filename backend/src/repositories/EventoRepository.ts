import { IEventoRepository } from "../contracts/evento/IRepository";
import { Evento } from "../domain/entities/Evento";

export class EventoRepository implements IEventoRepository {
  private eventos: Evento[] = [];
  private nextId = 1;

  async findById(id: number): Promise<Evento | null> {
    const evento = this.eventos.find((e) => e.id === id);
    return evento || null;
  }

  async findAll(): Promise<Evento[]> {
    return [...this.eventos];
  }

  async insert(obj: Omit<Evento, "id" | "criadoEm">): Promise<Evento> {
    const novoEvento = new Evento(
      obj.nome,
      obj.data,
      obj.capacidadeTotal,
      obj.local,
      this.nextId++,
      new Date()
    );

    this.eventos.push(novoEvento);
    return novoEvento;
  }

  async update(id: number, obj: Partial<Evento>): Promise<Evento | null> {
    const index = this.eventos.findIndex((e) => e.id === id);

    if (index === -1) {
      return null;
    }

    const eventoAtual = this.eventos[index];
    const eventoAtualizado = new Evento(
      obj.nome ?? eventoAtual.nome,
      obj.data ?? eventoAtual.data,
      obj.capacidadeTotal ?? eventoAtual.capacidadeTotal,
      obj.local ?? eventoAtual.local,
      eventoAtual.id,
      eventoAtual.criadoEm
    );

    this.eventos[index] = eventoAtualizado;
    return eventoAtualizado;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.eventos.findIndex((e) => e.id === id);

    if (index === -1) {
      return false;
    }

    this.eventos.splice(index, 1);
    return true;
  }

  async findByDate(data: Date): Promise<Evento[]> {
    return this.eventos.filter(
      (evento) => evento.data.toDateString() === new Date(data).toDateString()
    );
  }

  async findByLocal(local: string): Promise<Evento[]> {
    return this.eventos.filter((evento) =>
      evento.local.toLowerCase().includes(local.toLowerCase())
    );
  }

  async updateCapacity(
    id: number,
    novaCapacidade: number
  ): Promise<Evento | null> {
    const evento = this.eventos.find((e) => e.id === id);

    if (!evento) {
      return null;
    }

    return this.update(id, { capacidadeTotal: novaCapacidade });
  }

  async checkAvailability(
    id: number,
    quantidadeRequerida: number
  ): Promise<boolean> {
    const evento = this.eventos.find((e) => e.id === id);

    if (!evento) {
      return false;
    }

    return evento.capacidadeTotal >= quantidadeRequerida;
  }
}
