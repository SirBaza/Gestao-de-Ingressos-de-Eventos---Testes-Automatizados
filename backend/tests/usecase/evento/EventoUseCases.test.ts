import { CriarEventoUseCase } from "../../../src/domain/usecase/evento/CriarEventoUseCase";
import { ListarEventosUseCase } from "../../../src/domain/usecase/evento/ListarEventosUseCase";
import { IEventoRepository } from "../../../src/contracts/evento/IRepository";
import { Evento } from "../../../src/domain/entities/Evento";

class FakeEventoRepository implements IEventoRepository {
  private eventos: Evento[] = [
    new Evento(
      "Show de Rock",
      new Date("2025-12-31"),
      1000,
      "Arena Central",
      1,
      new Date()
    ),
    new Evento(
      "Festival Jazz",
      new Date("2026-01-15"),
      500,
      "Teatro Municipal",
      2,
      new Date()
    ),
  ];
  private nextId = 3;

  async findById(id: number): Promise<Evento | null> {
    return this.eventos.find((e) => e.id === id) || null;
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
    if (index === -1) return null;

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
    if (index === -1) return false;
    this.eventos.splice(index, 1);
    return true;
  }

  async findByDate(data: Date): Promise<Evento[]> {
    return this.eventos.filter(
      (e) => e.data.toDateString() === data.toDateString()
    );
  }

  async findByLocal(local: string): Promise<Evento[]> {
    return this.eventos.filter((e) => e.local === local);
  }

  async updateCapacity(
    id: number,
    novaCapacidade: number
  ): Promise<Evento | null> {
    return this.update(id, { capacidadeTotal: novaCapacidade });
  }

  async checkAvailability(
    id: number,
    quantidadeRequerida: number
  ): Promise<boolean> {
    const evento = await this.findById(id);
    if (!evento) return false;
    return evento.capacidadeTotal >= quantidadeRequerida;
  }
}

describe("CriarEventoUseCase", () => {
  test("deve ser capaz de instanciar o use case", () => {
    const repository = new FakeEventoRepository();
    const useCase = new CriarEventoUseCase(repository);
    expect(useCase).toBeInstanceOf(CriarEventoUseCase);
  });

  test("deve criar um evento com sucesso", async () => {
    const repository = new FakeEventoRepository();
    const useCase = new CriarEventoUseCase(repository);

    const resultado = await useCase.execute({
      nome: "Novo Evento",
      data: new Date("2026-06-15"),
      capacidadeTotal: 2000,
      local: "Estádio",
    });

    expect(resultado).toBeDefined();
    expect(resultado.nome).toBe("Novo Evento");
    expect(resultado.capacidadeTotal).toBe(2000);
    expect(resultado.id).toBe(3);
  });
});

describe("ListarEventosUseCase", () => {
  test("deve ser capaz de instanciar o use case", () => {
    const repository = new FakeEventoRepository();
    const useCase = new ListarEventosUseCase(repository);
    expect(useCase).toBeInstanceOf(ListarEventosUseCase);
  });

  test("deve listar todos os eventos", async () => {
    const repository = new FakeEventoRepository();
    const useCase = new ListarEventosUseCase(repository);

    const resultado = await useCase.execute({});

    expect(resultado).toHaveLength(2);
    expect(resultado[0].nome).toBe("Show de Rock");
  });

  test("deve filtrar eventos por data", async () => {
    const repository = new FakeEventoRepository();
    const useCase = new ListarEventosUseCase(repository);

    const resultado = await useCase.execute({ data: new Date("2025-12-31") });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe("Show de Rock");
  });

  test("deve filtrar eventos por local", async () => {
    const repository = new FakeEventoRepository();
    const useCase = new ListarEventosUseCase(repository);

    const resultado = await useCase.execute({ local: "Arena Central" });

    expect(resultado).toHaveLength(1);
    expect(resultado[0].nome).toBe("Show de Rock");
  });
});
