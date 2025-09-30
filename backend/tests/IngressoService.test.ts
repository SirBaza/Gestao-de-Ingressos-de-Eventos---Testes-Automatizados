import { IngressoService } from "../src/services/IngressoService";

describe("IngressoService", () => {
  let ingressoService: IngressoService;

  beforeEach(() => {
    ingressoService = new IngressoService();
  });

  describe("Criação de ingresso com hash", () => {
    test("deve criar ingresso com hash válido", () => {
      const compraId = 1;
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Teste",
        tipo: "VIP",
        usuario: "João Silva",
      };

      const ingresso = ingressoService.criarIngresso(compraId, payload);

      expect(ingresso).toBeDefined();
      expect(ingresso.id).toBeDefined();
      expect(ingresso.compraId).toBe(compraId);
      expect(ingresso.hash).toBeDefined();
      expect(ingresso.hash.length).toBe(64); // SHA-256
      expect(ingresso.usado).toBe(false);
      expect(ingresso.dataUso).toBeUndefined();
      expect(ingresso.criadoEm).toBeDefined();
    });

    test("deve criar ingressos diferentes com hashes únicos", () => {
      const payload1 = { ingressoId: 1, evento: "Evento A" };
      const payload2 = { ingressoId: 2, evento: "Evento B" };

      const ingresso1 = ingressoService.criarIngresso(1, payload1);
      const ingresso2 = ingressoService.criarIngresso(2, payload2);

      expect(ingresso1.hash).not.toBe(ingresso2.hash);
      expect(ingresso1.id).not.toBe(ingresso2.id);
    });
  });

  describe("Uso único do ingresso - Primeira validação", () => {
    test("primeira validação deve marcar ingresso como usado", () => {
      const compraId = 1;
      const payload = {
        ingressoId: 1,
        compraId: 1,
        evento: "Evento Teste",
        usuario: "Maria Silva",
      };

      const ingresso = ingressoService.criarIngresso(compraId, payload);

      // Primeira validação
      const resultado = ingressoService.validarIngresso(ingresso.hash);

      expect(resultado.valido).toBe(true);
      expect(resultado.mensagem).toBe("Ingresso válido e marcado como usado");
      expect(resultado.ingresso).toBeDefined();
      expect(resultado.ingresso!.usado).toBe(true);
      expect(resultado.ingresso!.dataUso).toBeDefined();
      expect(resultado.ingresso!.dataUso).toBeInstanceOf(Date);
    });

    test("deve validar ingresso existente na primeira tentativa", () => {
      const payload = {
        ingressoId: 123,
        evento: "Festival",
        usuario: "Pedro Costa",
      };

      const ingresso = ingressoService.criarIngresso(1, payload);

      // Verificar estado inicial
      expect(ingresso.usado).toBe(false);
      expect(ingressoService.verificarSeJaFoiUsado(ingresso.hash)).toBe(false);

      // Primeira validação
      const resultado = ingressoService.validarIngresso(ingresso.hash);

      expect(resultado.valido).toBe(true);
      expect(resultado.ingresso!.usado).toBe(true);
      expect(ingressoService.verificarSeJaFoiUsado(ingresso.hash)).toBe(true);
    });
  });

  describe("Uso único do ingresso - Segunda validação", () => {
    test('segunda validação deve retornar "já utilizado"', () => {
      const payload = {
        ingressoId: 1,
        evento: "Evento Teste",
        usuario: "Ana Santos",
      };

      const ingresso = ingressoService.criarIngresso(1, payload);

      // Primeira validação (marca como usado)
      const primeiraValidacao = ingressoService.validarIngresso(ingresso.hash);
      expect(primeiraValidacao.valido).toBe(true);

      // Segunda validação (deve falhar)
      const segundaValidacao = ingressoService.validarIngresso(ingresso.hash);

      expect(segundaValidacao.valido).toBe(false);
      expect(segundaValidacao.mensagem).toBe("Ingresso já utilizado");
      expect(segundaValidacao.ingresso).toBeDefined();
      expect(segundaValidacao.ingresso!.usado).toBe(true);
      expect(segundaValidacao.ingresso!.dataUso).toBeDefined();
    });

    test("deve manter registro da data de uso após primeira validação", () => {
      const payload = {
        ingressoId: 1,
        evento: "Evento Data",
        usuario: "Carlos Lima",
      };

      const ingresso = ingressoService.criarIngresso(1, payload);

      // Primeira validação
      const antes = new Date();
      const primeiraValidacao = ingressoService.validarIngresso(ingresso.hash);
      const depois = new Date();

      expect(primeiraValidacao.valido).toBe(true);
      expect(
        primeiraValidacao.ingresso!.dataUso!.getTime()
      ).toBeGreaterThanOrEqual(antes.getTime());
      expect(
        primeiraValidacao.ingresso!.dataUso!.getTime()
      ).toBeLessThanOrEqual(depois.getTime());

      // Segunda validação deve manter a mesma data de uso
      const dataUsoOriginal = primeiraValidacao.ingresso!.dataUso!;
      const segundaValidacao = ingressoService.validarIngresso(ingresso.hash);

      expect(segundaValidacao.valido).toBe(false);
      expect(segundaValidacao.ingresso!.dataUso).toEqual(dataUsoOriginal);
    });

    test("deve permitir múltiplas tentativas de validação após uso", () => {
      const payload = {
        ingressoId: 1,
        evento: "Evento Múltiplo",
        usuario: "Laura Dias",
      };

      const ingresso = ingressoService.criarIngresso(1, payload);

      // Primeira validação
      const primeira = ingressoService.validarIngresso(ingresso.hash);
      expect(primeira.valido).toBe(true);

      // Múltiplas tentativas subsequentes
      for (let i = 0; i < 5; i++) {
        const validacao = ingressoService.validarIngresso(ingresso.hash);
        expect(validacao.valido).toBe(false);
        expect(validacao.mensagem).toBe("Ingresso já utilizado");
      }
    });
  });

  describe("Validação de ingresso inexistente", () => {
    test("deve retornar erro para hash de ingresso inexistente", () => {
      const hashInexistente =
        "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd";

      const resultado = ingressoService.validarIngresso(hashInexistente);

      expect(resultado.valido).toBe(false);
      expect(resultado.mensagem).toBe("Ingresso não encontrado");
      expect(resultado.ingresso).toBeUndefined();
    });

    test("deve retornar false para verificação de uso de hash inexistente", () => {
      const hashInexistente = "hash_que_nao_existe_no_sistema";

      const jaFoiUsado = ingressoService.verificarSeJaFoiUsado(hashInexistente);

      expect(jaFoiUsado).toBe(false);
    });
  });

  describe("Listagem de ingressos por compra", () => {
    test("deve listar ingressos de uma compra específica", () => {
      const compraId = 1;
      const payloads = [
        { ingressoId: 1, tipo: "VIP" },
        { ingressoId: 2, tipo: "VIP" },
        { ingressoId: 3, tipo: "VIP" },
      ];

      // Criar ingressos para a compra
      const ingressos = payloads.map((payload) =>
        ingressoService.criarIngresso(compraId, payload)
      );

      // Criar ingresso para compra diferente
      ingressoService.criarIngresso(2, { ingressoId: 4, tipo: "Comum" });

      const ingressosDaCompra =
        ingressoService.listarIngressosPorCompra(compraId);

      expect(ingressosDaCompra).toHaveLength(3);
      ingressosDaCompra.forEach((ingresso) => {
        expect(ingresso.compraId).toBe(compraId);
      });
    });

    test("deve retornar array vazio para compra sem ingressos", () => {
      const compraSemIngressos = 999;

      const ingressos =
        ingressoService.listarIngressosPorCompra(compraSemIngressos);

      expect(ingressos).toHaveLength(0);
      expect(Array.isArray(ingressos)).toBe(true);
    });
  });

  describe("Cenários integrados de uso", () => {
    test("deve simular fluxo completo de criação e validação", () => {
      const payload = {
        eventoId: 1,
        tipoIngressoId: 1,
        compraId: 1,
        usuario: {
          nome: "Roberto Silva",
          email: "roberto@email.com",
          matricula: "2021005",
        },
        evento: {
          nome: "Evento Integrado",
          data: "2023-12-25T20:00:00Z",
        },
      };

      // 1. Criar ingresso
      const ingresso = ingressoService.criarIngresso(1, payload);
      expect(ingresso.usado).toBe(false);

      // 2. Verificar que não foi usado
      expect(ingressoService.verificarSeJaFoiUsado(ingresso.hash)).toBe(false);

      // 3. Primeira validação (sucesso)
      const primeira = ingressoService.validarIngresso(ingresso.hash);
      expect(primeira.valido).toBe(true);
      expect(primeira.ingresso!.usado).toBe(true);

      // 4. Verificar que agora está marcado como usado
      expect(ingressoService.verificarSeJaFoiUsado(ingresso.hash)).toBe(true);

      // 5. Tentativas subsequentes (devem falhar)
      const segunda = ingressoService.validarIngresso(ingresso.hash);
      expect(segunda.valido).toBe(false);
      expect(segunda.mensagem).toBe("Ingresso já utilizado");

      const terceira = ingressoService.validarIngresso(ingresso.hash);
      expect(terceira.valido).toBe(false);
      expect(terceira.mensagem).toBe("Ingresso já utilizado");
    });
  });
});
