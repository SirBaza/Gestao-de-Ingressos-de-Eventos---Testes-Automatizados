import { TipoIngressoRepository } from "../../src/repositories/TipoIngressoRepository";
import { TipoIngresso } from "../../src/domain/entities/TipoIngresso";

function createSUT() {
  const repository = new TipoIngressoRepository();
  return { repository };
}

describe("TipoIngressoRepository", () => {
  test("deve ser capaz de instanciar um repository", () => {
    // GIVEN
    const { repository } = createSUT();

    // WHEN

    // THEN
    expect(repository).toBeInstanceOf(TipoIngressoRepository);
  });

  describe("findById", () => {
    test("deve retornar um tipo de ingresso pelo ID", async () => {
      // Given
      const { repository } = createSUT();
      const tipoInserido = await repository.insert({
        eventoId: 1,
        nome: "VIP",

        preco: 200,
        quantidadeDisponivel: 50,
        quantidadeInicial: 50,
      });

      // When
      const resultado = await repository.findById(tipoInserido.id!);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.id).toBe(tipoInserido.id);
      expect(resultado?.nome).toBe("VIP");
      expect(resultado?.preco).toBe(200);
    });

    test("deve retornar null quando o tipo de ingresso não existir", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findById(999);

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("findAll", () => {
    test("deve retornar todos os tipos de ingresso", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        eventoId: 1,
        nome: "VIP",

        preco: 200,
        quantidadeDisponivel: 50,
        quantidadeInicial: 50,
      });
      await repository.insert({
        eventoId: 1,
        nome: "Pista",

        preco: 100,
        quantidadeDisponivel: 200,
        quantidadeInicial: 200,
      });

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe("VIP");
      expect(resultado[1].nome).toBe("Pista");
    });

    test("deve retornar um array vazio quando não houver tipos de ingresso", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toEqual([]);
    });
  });

  describe("insert", () => {
    test("deve ser capaz de inserir um tipo de ingresso", async () => {
      // Given
      const { repository } = createSUT();
      const tipoData = {
        eventoId: 1,
        nome: "VIP Premium",

        preco: 300,
        quantidadeDisponivel: 30,
        quantidadeInicial: 30,
      };

      // When
      const resultado = await repository.insert(tipoData);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(resultado.nome).toBe("VIP Premium");
      expect(resultado.preco).toBe(300);
      expect(resultado.quantidadeDisponivel).toBe(30);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
    });

    test("deve incrementar o ID a cada inserção", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const tipo1 = await repository.insert({
        eventoId: 1,
        nome: "Tipo 1",

        preco: 100,
        quantidadeDisponivel: 50,
        quantidadeInicial: 50,
      });
      const tipo2 = await repository.insert({
        eventoId: 1,
        nome: "Tipo 2",

        preco: 150,
        quantidadeDisponivel: 30,
        quantidadeInicial: 30,
      });

      // Then
      expect(tipo2.id).toBe(tipo1.id! + 1);
    });
  });

  describe("update", () => {
    test("deve ser capaz de atualizar um tipo de ingresso", async () => {
      // Given
      const { repository } = createSUT();
      const tipoInserido = await repository.insert({
        eventoId: 1,
        nome: "VIP",

        preco: 200,
        quantidadeDisponivel: 50,
        quantidadeInicial: 50,
      });

      // When
      const resultado = await repository.update(tipoInserido.id!, {
        preco: 250,
        quantidadeDisponivel: 40,
        quantidadeInicial: 40,
      });

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.preco).toBe(250);
      expect(resultado?.quantidadeDisponivel).toBe(40);
      expect(resultado?.nome).toBe("VIP"); // Mantém dados não alterados
    });

    test("deve retornar null quando tentar atualizar tipo inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.update(999, {
        preco: 300,
      });

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("delete", () => {
    test("deve ser capaz de deletar um tipo de ingresso", async () => {
      // Given
      const { repository } = createSUT();
      const tipoInserido = await repository.insert({
        eventoId: 1,
        nome: "VIP",

        preco: 200,
        quantidadeDisponivel: 50,
        quantidadeInicial: 50,
      });

      // When
      const resultado = await repository.delete(tipoInserido.id!);

      // Then
      expect(resultado).toBe(true);
      const tipoApagado = await repository.findById(tipoInserido.id!);
      expect(tipoApagado).toBeNull();
    });

    test("deve retornar false quando tentar deletar tipo inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.delete(999);

      // Then
      expect(resultado).toBe(false);
    });
  });

  describe("findByEvento", () => {
    test("deve retornar tipos de ingresso de um evento específico", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        eventoId: 1,
        nome: "VIP Evento 1",

        preco: 200,
        quantidadeDisponivel: 50,
        quantidadeInicial: 50,
      });
      await repository.insert({
        eventoId: 2,
        nome: "VIP Evento 2",

        preco: 250,
        quantidadeDisponivel: 30,
        quantidadeInicial: 30,
      });
      await repository.insert({
        eventoId: 1,
        nome: "Pista Evento 1",

        preco: 100,
        quantidadeDisponivel: 200,
        quantidadeInicial: 200,
      });

      // When
      const resultado = await repository.findByEvento(1);

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe("VIP Evento 1");
      expect(resultado[1].nome).toBe("Pista Evento 1");
    });

    test("deve retornar array vazio quando não houver tipos para o evento", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findByEvento(999);

      // Then
      expect(resultado).toEqual([]);
    });
  });

  describe("reduceStock", () => {
    test("deve reduzir o estoque de um tipo de ingresso", async () => {
      // Given
      const { repository } = createSUT();
      const tipoInserido = await repository.insert({
        eventoId: 1,
        nome: "VIP",

        preco: 200,
        quantidadeDisponivel: 50,
        quantidadeInicial: 50,
      });

      // When
      const resultado = await repository.reduceStock(tipoInserido.id!, 10);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado).not.toBeNull();
      expect(resultado?.quantidadeDisponivel).toBe(40);
    });

    test("deve retornar null quando não houver estoque suficiente", async () => {
      // Given
      const { repository } = createSUT();
      const tipoInserido = await repository.insert({
        eventoId: 1,
        nome: "VIP",

        preco: 200,
        quantidadeDisponivel: 5,
        quantidadeInicial: 5,
      });

      // When
      const resultado = await repository.reduceStock(tipoInserido.id!, 10);

      // Then
      expect(resultado).toBeNull();
      const tipoNaoAlterado = await repository.findById(tipoInserido.id!);
      expect(tipoNaoAlterado?.quantidadeDisponivel).toBe(5); // Não alterou
    });

    test("deve retornar null quando o tipo não existir", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.reduceStock(999, 10);

      // Then
      expect(resultado).toBeNull();
    });
  });
});
