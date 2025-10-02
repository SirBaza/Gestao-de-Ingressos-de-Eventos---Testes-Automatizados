import { CriarCompraUseCase } from "../../../src/domain/usecase/compra/CriarCompraUseCase";
import { ICompraRepository } from "../../../src/contracts/compra/IRepository";
import { Compra } from "../../../src/domain/entities/Compra";

class FakeCompraRepository implements ICompraRepository {
  private compras: Compra[] = [];
  private nextId = 1;

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
      this.nextId++,
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

class FakeCompraRepositoryComErro implements ICompraRepository {
  async findById(id: number): Promise<Compra | null> {
    throw new Error("Erro ao buscar compra");
  }

  async findAll(): Promise<Compra[]> {
    throw new Error("Erro ao listar compras");
  }

  async insert(obj: Omit<Compra, "id" | "criadoEm">): Promise<Compra> {
    throw new Error("Erro ao criar compra");
  }

  async update(id: number, obj: Partial<Compra>): Promise<Compra | null> {
    throw new Error("Erro ao atualizar compra");
  }

  async delete(id: number): Promise<boolean> {
    throw new Error("Erro ao deletar compra");
  }

  async findByEvento(eventoId: number): Promise<Compra[]> {
    throw new Error("Erro ao buscar compras por evento");
  }

  async findByEmail(email: string): Promise<Compra[]> {
    throw new Error("Erro ao buscar compras por email");
  }

  async calculateTotalTicketsSold(eventoId: number): Promise<number> {
    throw new Error("Erro ao calcular total de ingressos");
  }

  async calculateTotalRevenue(eventoId: number): Promise<number> {
    throw new Error("Erro ao calcular receita total");
  }
}

function createSUT(repository: ICompraRepository) {
  const useCase = new CriarCompraUseCase(repository);
  return { useCase };
}

describe("CriarCompraUseCase", () => {
  test("deve ser capaz de instanciar o use case", () => {
    // GIVEN
    const repository = new FakeCompraRepository();

    // WHEN
    const { useCase } = createSUT(repository);

    // THEN
    expect(useCase).toBeInstanceOf(CriarCompraUseCase);
  });

  test("deve criar uma compra com sucesso", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const { useCase } = createSUT(repository);
    const compraData = {
      eventoId: 1,
      tipoIngressoId: 1,
      nome: "João Silva",
      email: "joao@test.com",
      matricula: "123456",
      quantidade: 2,
      valorTotal: 100,
    };

    // WHEN
    const resultado = await useCase.execute(compraData);

    // THEN
    expect(resultado).toBeDefined();
    expect(resultado.id).toBeDefined();
    expect(resultado.nome).toBe("João Silva");
    expect(resultado.email).toBe("joao@test.com");
    expect(resultado.quantidade).toBe(2);
    expect(resultado.valorTotal).toBe(100);
  });

  test("deve criar múltiplas compras com IDs diferentes", async () => {
    // GIVEN
    const repository = new FakeCompraRepository();
    const { useCase } = createSUT(repository);

    // WHEN
    const compra1 = await useCase.execute({
      eventoId: 1,
      tipoIngressoId: 1,
      nome: "João",
      email: "joao@test.com",
      matricula: "123",
      quantidade: 1,
      valorTotal: 50,
    });
    const compra2 = await useCase.execute({
      eventoId: 1,
      tipoIngressoId: 2,
      nome: "Maria",
      email: "maria@test.com",
      matricula: "456",
      quantidade: 2,
      valorTotal: 100,
    });

    // THEN
    expect(compra1.id).toBe(1);
    expect(compra2.id).toBe(2);
  });

  test("deve lançar erro quando o repositório falhar", async () => {
    // GIVEN
    const repository = new FakeCompraRepositoryComErro();
    const { useCase } = createSUT(repository);
    const compraData = {
      eventoId: 1,
      tipoIngressoId: 1,
      nome: "João Silva",
      email: "joao@test.com",
      matricula: "123456",
      quantidade: 2,
      valorTotal: 100,
    };

    // WHEN/THEN
    await expect(useCase.execute(compraData)).rejects.toThrow(
      "Erro ao criar compra"
    );
  });
});
