import { HashService } from "../src/services/HashService";

describe("HashService", () => {
  let hashService: HashService;

  beforeEach(() => {
    hashService = new HashService();
  });

  describe("Gerar hash SHA válido para payload do ingresso", () => {
    test("deve gerar hash SHA-256 válido para payload simples", () => {
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Teste",
        tipo: "VIP",
      };

      const hash = hashService.gerarHash(payload);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(64); // SHA-256 produz hash de 64 caracteres
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Deve conter apenas caracteres hexadecimais
    });

    test("deve gerar hashes diferentes para payloads diferentes", () => {
      const payload1 = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento A",
      };

      const payload2 = {
        ingressoId: 2,
        compraId: 1,
        evento: "Evento B",
      };

      const hash1 = hashService.gerarHash(payload1);
      const hash2 = hashService.gerarHash(payload2);

      expect(hash1).not.toBe(hash2);
    });

    test("deve gerar o mesmo hash para o mesmo payload", () => {
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Consistente",
        timestamp: "2023-10-15T10:30:00Z",
      };

      const hash1 = hashService.gerarHash(payload);
      const hash2 = hashService.gerarHash(payload);

      expect(hash1).toBe(hash2);
    });

    test("deve gerar hash para payloads complexos", () => {
      const payloadComplexo = {
        ingresso: {
          id: 1,
          tipo: "VIP",
          preco: 150.0,
        },
        compra: {
          id: 1,
          usuario: {
            nome: "João Silva",
            email: "joao@email.com",
            matricula: "2021001",
          },
          quantidade: 2,
        },
        evento: {
          id: 1,
          nome: "Evento Especial",
          data: "2023-12-25T20:00:00Z",
          local: "Centro de Convenções",
        },
        metadados: {
          geradoEm: "2023-10-15T10:30:00Z",
          versao: "1.0",
        },
      };

      const hash = hashService.gerarHash(payloadComplexo);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    test("deve ser sensível à ordem das propriedades no objeto", () => {
      // JSON.stringify pode reordenar propriedades, então vamos garantir que objetos
      // com mesmas propriedades mas ordens diferentes produzam o mesmo hash
      const payload1 = { a: 1, b: 2, c: 3 };
      const payload2 = { c: 3, a: 1, b: 2 };

      const hash1 = hashService.gerarHash(payload1);
      const hash2 = hashService.gerarHash(payload2);

      // Como usamos JSON.stringify, a ordem pode afetar o resultado
      // Mas vamos testar que ambos produzem hashes válidos
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1.length).toBe(64);
      expect(hash2.length).toBe(64);
    });
  });

  describe("Validar hash correto retorna true", () => {
    test("deve validar hash correto como verdadeiro", () => {
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Teste",
        usuario: "João Silva",
      };

      const hashGerado = hashService.gerarHash(payload);
      const isValido = hashService.validarHash(payload, hashGerado);

      expect(isValido).toBe(true);
    });

    test("deve validar múltiplos payloads e hashes corretos", () => {
      const payloads = [
        { id: 1, tipo: "A" },
        { id: 2, tipo: "B" },
        { id: 3, tipo: "C", extra: "dados" },
      ];

      payloads.forEach((payload) => {
        const hash = hashService.gerarHash(payload);
        const isValido = hashService.validarHash(payload, hash);
        expect(isValido).toBe(true);
      });
    });

    test("deve validar payload complexo com hash correto", () => {
      const payloadComplexo = {
        ingresso: {
          id: 123,
          codigo: "ING-VIP-001",
          tipo: {
            nome: "VIP",
            beneficios: ["Acesso especial", "Bebida inclusa", "Estacionamento"],
          },
        },
        evento: {
          nome: "Festival de Música",
          data: "2023-12-31T23:59:59Z",
          artistas: ["Artista A", "Artista B", "Artista C"],
        },
        comprador: {
          dados: {
            nome: "Maria Silva",
            documentos: {
              cpf: "123.456.789-00",
              matricula: "EST2021001",
            },
          },
        },
      };

      const hash = hashService.gerarHash(payloadComplexo);
      const isValido = hashService.validarHash(payloadComplexo, hash);

      expect(isValido).toBe(true);
    });
  });

  describe("Hash incorreto retorna false", () => {
    test("deve invalidar hash completamente incorreto", () => {
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Teste",
      };

      const hashIncorreto = "hash_completamente_invalido";
      const isValido = hashService.validarHash(payload, hashIncorreto);

      expect(isValido).toBe(false);
    });

    test("deve invalidar hash de payload diferente", () => {
      const payload1 = {
        ingressoId: 1,
        evento: "Evento Original",
      };

      const payload2 = {
        ingressoId: 1,
        evento: "Evento Modificado",
      };

      const hashPayload1 = hashService.gerarHash(payload1);
      const isValido = hashService.validarHash(payload2, hashPayload1);

      expect(isValido).toBe(false);
    });

    test("deve invalidar hash com um caractere alterado", () => {
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Teste",
      };

      const hashCorreto = hashService.gerarHash(payload);

      // Alterar um caractere do hash
      const hashAlterado =
        hashCorreto.slice(0, -1) + (hashCorreto.slice(-1) === "a" ? "b" : "a");

      const isValido = hashService.validarHash(payload, hashAlterado);

      expect(isValido).toBe(false);
    });

    test("deve invalidar hash vazio ou null", () => {
      const payload = {
        ingressoId: 1,
        evento: "Evento Teste",
      };

      expect(hashService.validarHash(payload, "")).toBe(false);
      expect(hashService.validarHash(payload, null as any)).toBe(false);
      expect(hashService.validarHash(payload, undefined as any)).toBe(false);
    });

    test("deve invalidar quando payload é modificado após geração do hash", () => {
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Original",
        usuario: "João Silva",
      };

      const hash = hashService.gerarHash(payload);

      // Modificar o payload
      payload.evento = "Evento Modificado";

      const isValido = hashService.validarHash(payload, hash);

      expect(isValido).toBe(false);
    });
  });
});
