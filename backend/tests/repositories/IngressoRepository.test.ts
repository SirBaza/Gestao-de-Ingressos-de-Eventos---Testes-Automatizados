import { IngressoRepository } from "../../src/repositories/IngressoRepository";
import { Ingresso } from "../../src/domain/entities/Ingresso";

function createSUT() {
  const repository = new IngressoRepository();
  return { repository };
}

describe("IngressoRepository", () => {
  test("deve ser capaz de instanciar um repository", () => {
    // GIVEN
    const { repository } = createSUT();

    // WHEN

    // THEN
    expect(repository).toBeInstanceOf(IngressoRepository);
  });

  describe("findById", () => {
    test("deve retornar um ingresso pelo ID", async () => {
      // Given
      const { repository } = createSUT();
      const ingressoInserido = await repository.insert({
        compraId: 1,
        hash: "ABC123",
        usado: false,
      });

      // When
      const resultado = await repository.findById(ingressoInserido.id!);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.id).toBe(ingressoInserido.id);
      expect(resultado?.hash).toBe("ABC123");
      expect(resultado?.usado).toBe(false);
    });

    test("deve retornar null quando o ingresso não existir", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findById(999);

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("findAll", () => {
    test("deve retornar todos os ingressos", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        compraId: 1,

        hash: "ABC123",
        usado: false,
      });
      await repository.insert({
        compraId: 2,

        hash: "DEF456",
        usado: true,
      });

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].hash).toBe("ABC123");
      expect(resultado[1].hash).toBe("DEF456");
    });

    test("deve retornar um array vazio quando não houver ingressos", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findAll();

      // Then
      expect(resultado).toEqual([]);
    });
  });

  describe("insert", () => {
    test("deve ser capaz de inserir um ingresso", async () => {
      // Given
      const { repository } = createSUT();
      const ingressoData = {
        compraId: 1,

        hash: "ABC123XYZ",
        usado: false,
      };

      // When
      const resultado = await repository.insert(ingressoData);

      // Then
      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(resultado.hash).toBe("ABC123XYZ");
      expect(resultado.usado).toBe(false);
      expect(resultado.criadoEm).toBeInstanceOf(Date);
    });

    test("deve incrementar o ID a cada inserção", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const ingresso1 = await repository.insert({
        compraId: 1,

        hash: "HASH1",
        usado: false,
      });
      const ingresso2 = await repository.insert({
        compraId: 1,

        hash: "HASH2",
        usado: false,
      });

      // Then
      expect(ingresso2.id).toBe(ingresso1.id! + 1);
    });
  });

  describe("update", () => {
    test("deve ser capaz de atualizar um ingresso", async () => {
      // Given
      const { repository } = createSUT();
      const ingressoInserido = await repository.insert({
        compraId: 1,

        hash: "ABC123",
        usado: false,
      });

      // When
      const resultado = await repository.update(ingressoInserido.id!, {
        usado: true,
      });

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.usado).toBe(true);
      expect(resultado?.hash).toBe("ABC123"); // Mantém dados não alterados
    });

    test("deve retornar null quando tentar atualizar ingresso inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.update(999, {
        usado: true,
      });

      // Then
      expect(resultado).toBeNull();
    });
  });

  describe("delete", () => {
    test("deve ser capaz de deletar um ingresso", async () => {
      // Given
      const { repository } = createSUT();
      const ingressoInserido = await repository.insert({
        compraId: 1,

        hash: "ABC123",
        usado: false,
      });

      // When
      const resultado = await repository.delete(ingressoInserido.id!);

      // Then
      expect(resultado).toBe(true);
      const ingressoApagado = await repository.findById(ingressoInserido.id!);
      expect(ingressoApagado).toBeNull();
    });

    test("deve retornar false quando tentar deletar ingresso inexistente", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.delete(999);

      // Then
      expect(resultado).toBe(false);
    });
  });

  describe("findByCompra", () => {
    test("deve retornar ingressos de uma compra específica", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        compraId: 1,

        hash: "HASH1",
        usado: false,
      });
      await repository.insert({
        compraId: 2,

        hash: "HASH2",
        usado: false,
      });
      await repository.insert({
        compraId: 1,

        hash: "HASH3",
        usado: true,
      });

      // When
      const resultado = await repository.findByCompra(1);

      // Then
      expect(resultado).toHaveLength(2);
      expect(resultado[0].hash).toBe("HASH1");
      expect(resultado[1].hash).toBe("HASH3");
    });

    test("deve retornar array vazio quando não houver ingressos da compra", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findByCompra(999);

      // Then
      expect(resultado).toEqual([]);
    });
  });

  describe("findByHash", () => {
    test("deve retornar um ingresso pelo hash", async () => {
      // Given
      const { repository } = createSUT();
      await repository.insert({
        compraId: 1,

        hash: "UNIQUE_HASH_123",
        usado: false,
      });

      // When
      const resultado = await repository.findByHash("UNIQUE_HASH_123");

      // Then
      expect(resultado).toBeDefined();
      expect(resultado?.hash).toBe("UNIQUE_HASH_123");
      expect(resultado?.usado).toBe(false);
    });

    test("deve retornar null quando não encontrar ingresso com o hash", async () => {
      // Given
      const { repository } = createSUT();

      // When
      const resultado = await repository.findByHash("HASH_INEXISTENTE");

      // Then
      expect(resultado).toBeNull();
    });
  });
});
