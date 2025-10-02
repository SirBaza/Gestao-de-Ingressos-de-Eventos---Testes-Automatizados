import { HashRepository } from "../../src/repositories/HashRepository";

function createSUT() {
  const repository = new HashRepository();
  return { repository };
}

describe("HashRepository", () => {
  test("deve ser capaz de instanciar um repository", () => {
    // GIVEN
    const { repository } = createSUT();

    // WHEN

    // THEN
    expect(repository).toBeInstanceOf(HashRepository);
  });

  describe("generateHash", () => {
    test("deve gerar um hash a partir de um payload", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {
        compraId: 1,
        tipoIngressoId: 1,
        userId: "user123",
      };

      // When
      const hash = await repository.generateHash(payload);

      // Then
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    test("deve gerar o mesmo hash para o mesmo payload", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {
        compraId: 1,
        nome: "João Silva",
      };

      // When
      const hash1 = await repository.generateHash(payload);
      const hash2 = await repository.generateHash(payload);

      // Then
      expect(hash1).toBe(hash2);
    });

    test("deve gerar hashes diferentes para payloads diferentes", async () => {
      // Given
      const { repository } = createSUT();
      const payload1 = { id: 1, nome: "João" };
      const payload2 = { id: 2, nome: "Maria" };

      // When
      const hash1 = await repository.generateHash(payload1);
      const hash2 = await repository.generateHash(payload2);

      // Then
      expect(hash1).not.toBe(hash2);
    });

    test("deve gerar hash mesmo com payload vazio", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {};

      // When
      const hash = await repository.generateHash(payload);

      // Then
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });

  describe("validateHash", () => {
    test("deve validar um hash correto", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {
        compraId: 1,
        tipoIngressoId: 1,
      };
      const expectedHash = await repository.generateHash(payload);

      // When
      const isValid = await repository.validateHash(payload, expectedHash);

      // Then
      expect(isValid).toBe(true);
    });

    test("deve rejeitar um hash incorreto", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {
        compraId: 1,
        tipoIngressoId: 1,
      };
      const wrongHash = "hash_incorreto_123456";

      // When
      const isValid = await repository.validateHash(payload, wrongHash);

      // Then
      expect(isValid).toBe(false);
    });

    test("deve rejeitar quando o payload for diferente do hash", async () => {
      // Given
      const { repository } = createSUT();
      const payload1 = { id: 1, nome: "João" };
      const payload2 = { id: 2, nome: "Maria" };
      const hash1 = await repository.generateHash(payload1);

      // When
      const isValid = await repository.validateHash(payload2, hash1);

      // Then
      expect(isValid).toBe(false);
    });
  });

  describe("generateUniqueHash", () => {
    test("deve gerar um hash único", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {
        compraId: 1,
        tipoIngressoId: 1,
      };

      // When
      const hash = await repository.generateUniqueHash(payload);

      // Then
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    test("deve gerar hashes diferentes mesmo com o mesmo payload", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {
        compraId: 1,
        nome: "João Silva",
      };

      // When
      const hash1 = await repository.generateUniqueHash(payload);
      // Pequeno delay para garantir timestamp diferente
      await new Promise((resolve) => setTimeout(resolve, 10));
      const hash2 = await repository.generateUniqueHash(payload);

      // Then
      expect(hash1).not.toBe(hash2);
    });

    test("deve gerar múltiplos hashes únicos sequencialmente", async () => {
      // Given
      const { repository } = createSUT();
      const payload = { userId: "user123" };
      const hashes: string[] = [];

      // When
      for (let i = 0; i < 5; i++) {
        const hash = await repository.generateUniqueHash(payload);
        hashes.push(hash);
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      // Then
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(5); // Todos devem ser únicos
    });

    test("deve gerar hash único mesmo com payload vazio", async () => {
      // Given
      const { repository } = createSUT();
      const payload = {};

      // When
      const hash1 = await repository.generateUniqueHash(payload);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const hash2 = await repository.generateUniqueHash(payload);

      // Then
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("Integração entre métodos", () => {
    test("hash único não deve validar contra o hash normal do mesmo payload", async () => {
      // Given
      const { repository } = createSUT();
      const payload = { id: 1, nome: "Teste" };
      const normalHash = await repository.generateHash(payload);
      const uniqueHash = await repository.generateUniqueHash(payload);

      // When
      const isValidUnique = await repository.validateHash(payload, uniqueHash);

      // Then
      expect(normalHash).not.toBe(uniqueHash);
      expect(isValidUnique).toBe(false); // Não valida porque tem timestamp e random
    });
  });
});
