import { EventoRepository } from "../../src/repositories/EventoRepository";
import { Evento } from "../../src/domain/entities/Evento";

function createSUT() {
  const repository = new EventoRepository();
  return { repository };
}

describe("EventoRepository", () => {
  test("deve ser capaz de instanciar um repository", () => {
    // GIVEN
    const { repository } = createSUT();

    // WHEN

    // THEN
    expect(repository).toBeInstanceOf(EventoRepository);
  });

  describe("findById", () => {
    test("deve retornar um evento pelo ID", async () => {
      // Given
      const { repository } = createSUT();
      const eventoInserido = await repository.insert({
        nome: "Show de Rock",
        data: new Date("2025-12-31"),
        capacidadeTotal: 1000,
        local: "Arena Central",
      });

      // When
      const resultado = await repository.findById(eventoInserido.id!);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.id).toBe(eventoInserido.id);
      expect(resultado?.nome).toBe("Show de Rock");
      expect(resultado?.local).toBe("Arena Central");
    });

    test("deve retornar null quando o evento não existir", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findById(999);

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("findAll", () => {
    test("deve retornar todos os eventos", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        nome: "Show de Rock",
        data: new Date("2025-12-31"),
        capacidadeTotal: 1000,
        local: "Arena Central",
      });
      await repository.insert({
        nome: "Festival de Jazz",
        data: new Date("2026-01-15"),
        capacidadeTotal: 500,
        local: "Teatro Municipal",
      });

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe("Show de Rock");
      expect(resultado[1].nome).toBe("Festival de Jazz");
    });

    test("deve retornar um array vazio quando não houver eventos", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toEqual([]);
    });
  });

  describe("insert", () => {
    test("deve ser capaz de inserir um evento", async () => {
      // Given
      const { repository } = createSUT();
      const eventoData = {
        nome: "Show de Rock",
        data: new Date("2025-12-31"),
        capacidadeTotal: 1000,
        local: "Arena Central",
      };

      // When
      const resultado = await repository.insert(eventoData);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(resultado.nome).toBe("Show de Rock");
      expect(resultado.capacidadeTotal).toBe(1000);
      expect(resultado.local).toBe("Arena Central");
      expect(resultado.criadoEm).toBeInstanceOf(Date);
    });

    test("deve incrementar o ID a cada inserção", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const evento1 = await repository.insert({
        nome: "Evento 1",
        data: new Date(),
        capacidadeTotal: 100,
        local: "Local 1",
      });
      const evento2 = await repository.insert({
        nome: "Evento 2",
        data: new Date(),
        capacidadeTotal: 200,
        local: "Local 2",
      });

      // Then
      expect(evento2.id).toBe(evento1.id! + 1);
    });
  });

  describe("update", () => {
    test("deve ser capaz de atualizar um evento", async () => {
      // Given
      const { repository } = createSUT();
      const eventoInserido = await repository.insert({
        nome: "Show de Rock",
        data: new Date("2025-12-31"),
        capacidadeTotal: 1000,
        local: "Arena Central",
      });

      // When
      const resultado = await repository.update(eventoInserido.id!, {
        capacidadeTotal: 1500,
        local: "Estádio Nacional",
      });

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.capacidadeTotal).toBe(1500);
      expect(resultado?.local).toBe("Estádio Nacional");
      expect(resultado?.nome).toBe("Show de Rock"); // Mantém dados não alterados
    });

    test("deve retornar null quando tentar atualizar evento inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.update(999, {
        capacidadeTotal: 2000,
      });

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("delete", () => {
    test("deve ser capaz de deletar um evento", async () => {
      // Given
      const { repository } = createSUT();
      const eventoInserido = await repository.insert({
        nome: "Show de Rock",
        data: new Date("2025-12-31"),
        capacidadeTotal: 1000,
        local: "Arena Central",
      });

      // When
      const resultado = await repository.delete(eventoInserido.id!);

      // Then
      expect(resultado).toBe(true);
      const eventoApagado = await repository.findById(eventoInserido.id!);
      expect(eventoApagado).toBeNull();
    });

    test("deve retornar false quando tentar deletar evento inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.delete(999);

      // Then
      expect(resultado).toBe(false);
    });
  });

  describe("findByDate", () => {
    test("deve retornar eventos em uma data específica", async () => {
      // Given
      const { repository } = createSUT();
      const data1 = new Date("2025-12-31");
      const data2 = new Date("2026-01-15");

      await repository.insert({
        nome: "Evento Ano Novo",
        data: data1,
        capacidadeTotal: 1000,
        local: "Arena Central",
      });
      await repository.insert({
        nome: "Evento Janeiro",
        data: data2,
        capacidadeTotal: 500,
        local: "Teatro Municipal",
      });
      await repository.insert({
        nome: "Outro Evento Ano Novo",
        data: data1,
        capacidadeTotal: 800,
        local: "Clube Social",
      });

      // When
      const resultado = await repository.findByDate(data1);

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe("Evento Ano Novo");
      expect(resultado[1].nome).toBe("Outro Evento Ano Novo");
    });

    test("deve retornar array vazio quando não houver eventos na data", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findByDate(new Date("2030-01-01"));

      // Then
      expect(resultado).toEqual([]);
    });
  });

  describe("findByLocal", () => {
    test("deve retornar eventos em um local específico", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        nome: "Show 1",
        data: new Date(),
        capacidadeTotal: 1000,
        local: "Arena Central",
      });
      await repository.insert({
        nome: "Show 2",
        data: new Date(),
        capacidadeTotal: 500,
        local: "Teatro Municipal",
      });
      await repository.insert({
        nome: "Show 3",
        data: new Date(),
        capacidadeTotal: 800,
        local: "Arena Central",
      });

      // When
      const resultado = await repository.findByLocal("Arena Central");

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe("Show 1");
      expect(resultado[1].nome).toBe("Show 3");
    });

    test("deve retornar array vazio quando não houver eventos no local", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findByLocal("Local Inexistente");

      // Then
      expect(resultado).toEqual([]);
    });
  });
});
