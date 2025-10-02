import { CompraRepository } from "../../src/repositories/CompraRepository";
import { Compra } from "../../src/domain/entities/Compra";

function createSUT() {
  const repository = new CompraRepository();
  return { repository };
}

describe("CompraRepository", () => {
  test("deve ser capaz de instanciar um repository", () => {
    // GIVEN
    const { repository } = createSUT();

    // WHEN

    // THEN
    expect(repository).toBeInstanceOf(CompraRepository);
  });

  describe("findById", () => {
    test("deve retornar uma compra pelo ID", async () => {
      // Given
      const { repository } = createSUT();
      const compraInserida = await repository.insert({
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João Silva",
        email: "joao@test.com",
        matricula: "123456",
        quantidade: 2,
        valorTotal: 100,
      });

      // When
      const resultado = await repository.findById(compraInserida.id!);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.id).toBe(compraInserida.id);
      expect(resultado?.nome).toBe("João Silva");
      expect(resultado?.email).toBe("joao@test.com");
    });

    test("deve retornar null quando a compra não existir", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findById(999);

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("findAll", () => {
    test("deve retornar todas as compras", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João Silva",
        email: "joao@test.com",
        matricula: "123456",
        quantidade: 2,
        valorTotal: 100,
      });
      await repository.insert({
        eventoId: 1,
        tipoIngressoId: 2,
        nome: "Maria Santos",
        email: "maria@test.com",
        matricula: "654321",
        quantidade: 1,
        valorTotal: 50,
      });

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe("João Silva");
      expect(resultado[1].nome).toBe("Maria Santos");
    });

    test("deve retornar um array vazio quando não houver compras", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toEqual([]);
    });
  });

  describe("insert", () => {
    test("deve ser capaz de inserir uma compra", async () => {
      // Given
      const { repository } = createSUT();
      const compraData = {
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João Silva",
        email: "joao@test.com",
        matricula: "123456",
        quantidade: 2,
        valorTotal: 100,
      };

      // When
      const resultado = await repository.insert(compraData);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(resultado.nome).toBe("João Silva");
      expect(resultado.email).toBe("joao@test.com");
      expect(resultado.quantidade).toBe(2);
      expect(resultado.valorTotal).toBe(100);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
    });

    test("deve incrementar o ID a cada inserção", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const compra1 = await repository.insert({
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João",
        email: "joao@test.com",
        matricula: "123",
        quantidade: 1,
        valorTotal: 50,
      });
      const compra2 = await repository.insert({
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "Maria",
        email: "maria@test.com",
        matricula: "456",
        quantidade: 1,
        valorTotal: 50,
      });

      // Then
      expect(compra2.id).toBe(compra1.id! + 1);
    });
  });

  describe("update", () => {
    test("deve ser capaz de atualizar uma compra", async () => {
      // Given
      const { repository } = createSUT();
      const compraInserida = await repository.insert({
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João Silva",
        email: "joao@test.com",
        matricula: "123456",
        quantidade: 2,
        valorTotal: 100,
      });

      // When
      const resultado = await repository.update(compraInserida.id!, {
        quantidade: 3,
        valorTotal: 150,
      });

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.quantidade).toBe(3);
      expect(resultado?.valorTotal).toBe(150);
      expect(resultado?.nome).toBe("João Silva"); // Mantém dados não alterados
    });

    test("deve retornar null quando tentar atualizar compra inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.update(999, {
        quantidade: 5,
      });

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("delete", () => {
    test("deve ser capaz de deletar uma compra", async () => {
      // Given
      const { repository } = createSUT();
      const compraInserida = await repository.insert({
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João Silva",
        email: "joao@test.com",
        matricula: "123456",
        quantidade: 2,
        valorTotal: 100,
      });

      // When
      const resultado = await repository.delete(compraInserida.id!);

      // Then
      expect(resultado).toBe(true);
      const compraApagada = await repository.findById(compraInserida.id!);
      expect(compraApagada).toBeNull();
    });

    test("deve retornar false quando tentar deletar compra inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.delete(999);

      // Then
      expect(resultado).toBe(false);
    });
  });

  describe("findByEvento", () => {
    test("deve retornar compras de um evento específico", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João Silva",
        email: "joao@test.com",
        matricula: "123456",
        quantidade: 2,
        valorTotal: 100,
      });
      await repository.insert({
        eventoId: 2,
        tipoIngressoId: 1,
        nome: "Maria Santos",
        email: "maria@test.com",
        matricula: "654321",
        quantidade: 1,
        valorTotal: 50,
      });
      await repository.insert({
        eventoId: 1,
        tipoIngressoId: 2,
        nome: "Pedro Costa",
        email: "pedro@test.com",
        matricula: "111222",
        quantidade: 3,
        valorTotal: 150,
      });

      // When
      const resultado = await repository.findByEvento(1);

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe("João Silva");
      expect(resultado[1].nome).toBe("Pedro Costa");
    });

    test("deve retornar array vazio quando não houver compras do evento", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findByEvento(999);

      // Then
      expect(resultado).toEqual([]);
    });
  });
});
