import { ListarComprasUseCase } from "../../../src/domain/usecase/compra/ListarComprasUseCase";
import { CalcularTotalUseCase } from "../../../src/domain/usecase/compra/CalcularTotalUseCase";
import { ICompraRepository } from "../../../src/contracts/compra/IRepository";
import { Compra } from "../../../src/domain/entities/Compra";

class FakeCompraRepository implements ICompraRepository {
  private compras: Compra[] = [
    new Compra(
      1,
      1,
      "João Silva",
      "joao@test.com",
      "123",
      2,
      100,
      1,
      new Date()
    ),
    new Compra(
      1,
      2,
      "Maria Santos",
      "maria@test.com",
      "456",
      3,
      150,
      2,
      new Date()
    ),
    new Compra(
      2,
      1,
      "Pedro Costa",
      "pedro@test.com",
      "789",
      1,
      50,
      3,
      new Date()
    ),
    new Compra(1, 1, "Ana Lima", "joao@test.com", "111", 1, 50, 4, new Date()), // mesmo email
  ];

  async findById(id: number): Promise<Compra | null> {
    return this.compras.find((c) => c.id === id) || null;
  }

  async findAll(): Promise<Compra[]> {
    return [...this.compras];
  }

  async insert(obj: Omit<Compra, "id" | "criadoEm">): Promise<Compra> {
    const novaCompra = new Compra(
      obj.eventoId,
      obj.tipoIngressoId,
      obj.nome,
      obj.email,
      obj.matricula,
      obj.quantidade,
      obj.valorTotal,
      this.compras.length + 1,
      new Date()
    );
    this.compras.push(novaCompra);
    return novaCompra;
  }

  async update(id: number, obj: Partial<Compra>): Promise<Compra | null> {
    return null;
  }

  async delete(id: number): Promise<boolean> {
    return false;
  }

  async findByEvento(eventoId: number): Promise<Compra[]> {
    return this.compras.filter((c) => c.eventoId === eventoId);
  }

  async findByEmail(email: string): Promise<Compra[]> {
    return this.compras.filter((c) => c.email === email);
  }

  async calculateTotalTicketsSold(eventoId: number): Promise<number> {
    return this.compras
      .filter((c) => c.eventoId === eventoId)
      .reduce((total, c) => total + c.quantidade, 0);
  }

  async calculateTotalRevenue(eventoId: number): Promise<number> {
    return this.compras
      .filter((c) => c.eventoId === eventoId)
      .reduce((total, c) => total + c.valorTotal, 0);
  }
}

describe("ListarComprasUseCase", () => {
  test("deve ser capaz de instanciar o use case", () => {
    // GIVEN
    const repository = new FakeCompraRepository();

    // WHEN
    const useCase = new ListarComprasUseCase(repository);

    // THEN
    expect(useCase).toBeInstanceOf(ListarComprasUseCase);
  });

  test("deve listar todas as compras quando não houver filtros", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const useCase = new ListarComprasUseCase(repository);

    // WHEN
    const resultado = await useCase.execute({});

    // THEN
    expect(resultado).toHaveLength(4);
    expect(resultado[0].nome).toBe("João Silva");
    expect(resultado[1].nome).toBe("Maria Santos");
  });

  test("deve filtrar compras por evento", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const useCase = new ListarComprasUseCase(repository);

    // WHEN
    const resultado = await useCase.execute({ eventoId: 1 });

    // THEN
    expect(resultado).toHaveLength(3);
    expect(resultado.every((c) => c.eventoId === 1)).toBe(true);
  });

  test("deve filtrar compras por email", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const useCase = new ListarComprasUseCase(repository);

    // WHEN
    const resultado = await useCase.execute({ email: "joao@test.com" });

    // THEN
    expect(resultado).toHaveLength(2);
    expect(resultado.every((c) => c.email === "joao@test.com")).toBe(true);
  });

  test("deve retornar array vazio quando não houver compras no filtro", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const useCase = new ListarComprasUseCase(repository);

    // WHEN
    const resultado = await useCase.execute({ eventoId: 999 });

    // THEN
    expect(resultado).toHaveLength(0);
  });
});

describe("CalcularTotalUseCase", () => {
  test("deve ser capaz de instanciar o use case", () => {
    // GIVEN
    const repository = new FakeCompraRepository();

    // WHEN
    const useCase = new CalcularTotalUseCase(repository);

    // THEN
    expect(useCase).toBeInstanceOf(CalcularTotalUseCase);
  });

  test("deve calcular total de ingressos e receita de um evento", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const useCase = new CalcularTotalUseCase(repository);

    // WHEN
    const resultado = await useCase.execute({ eventoId: 1 });

    // THEN
    expect(resultado.totalIngressos).toBe(6); // 2 + 3 + 1
    expect(resultado.receita).toBe(300); // 100 + 150 + 50
  });

  test("deve retornar zero quando não houver compras do evento", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const useCase = new CalcularTotalUseCase(repository);

    // WHEN
    const resultado = await useCase.execute({ eventoId: 999 });

    // THEN
    expect(resultado.totalIngressos).toBe(0);
    expect(resultado.receita).toBe(0);
  });

  test("deve calcular corretamente para evento com uma compra", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const useCase = new CalcularTotalUseCase(repository);

    // WHEN
    const resultado = await useCase.execute({ eventoId: 2 });

    // THEN
    expect(resultado.totalIngressos).toBe(1);
    expect(resultado.receita).toBe(50);
  });
});
