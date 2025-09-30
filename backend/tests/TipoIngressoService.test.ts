import { TipoIngressoService } from "../src/services/TipoIngressoService";

describe("TipoIngressoService", () => {
  let tipoIngressoService: TipoIngressoService;

  beforeEach(() => {
    tipoIngressoService = new TipoIngressoService();
  });

  describe("Criar tipo de ingresso com quantidade inicial", () => {
    test("deve criar tipo de ingresso com quantidade inicial definida", () => {
      const dadosTipoIngresso = {
        eventoId: 1,
        nome: "Ingresso VIP",
        preco: 150.0,
        quantidadeInicial: 50,
      };

      const tipoIngresso =
        tipoIngressoService.criarTipoIngresso(dadosTipoIngresso);

      expect(tipoIngresso).toBeDefined();
      expect(tipoIngresso.id).toBeDefined();
      expect(tipoIngresso.eventoId).toBe(dadosTipoIngresso.eventoId);
      expect(tipoIngresso.nome).toBe(dadosTipoIngresso.nome);
      expect(tipoIngresso.preco).toBe(dadosTipoIngresso.preco);
      expect(tipoIngresso.quantidadeInicial).toBe(
        dadosTipoIngresso.quantidadeInicial
      );
      expect(tipoIngresso.quantidadeDisponivel).toBe(
        dadosTipoIngresso.quantidadeInicial
      );
      expect(tipoIngresso.criadoEm).toBeDefined();
    });

    test("deve criar múltiplos tipos de ingresso com IDs únicos", () => {
      const dadosTipo1 = {
        eventoId: 1,
        nome: "Ingresso Comum",
        preco: 50.0,
        quantidadeInicial: 100,
      };

      const dadosTipo2 = {
        eventoId: 1,
        nome: "Ingresso VIP",
        preco: 150.0,
        quantidadeInicial: 25,
      };

      const tipo1 = tipoIngressoService.criarTipoIngresso(dadosTipo1);
      const tipo2 = tipoIngressoService.criarTipoIngresso(dadosTipo2);

      expect(tipo1.id).not.toBe(tipo2.id);
      expect(tipo1.quantidadeDisponivel).toBe(100);
      expect(tipo2.quantidadeDisponivel).toBe(25);
    });
  });

  describe("Impedir compra quando ingressos esgotados", () => {
    test("deve impedir compra quando quantidade disponível é zero", () => {
      const dadosTipoIngresso = {
        eventoId: 1,
        nome: "Ingresso Limitado",
        preco: 100.0,
        quantidadeInicial: 5,
      };

      const tipoIngresso =
        tipoIngressoService.criarTipoIngresso(dadosTipoIngresso);

      // Esgotar o estoque
      tipoIngressoService.reduzirEstoque(tipoIngresso.id!, 5);

      // Tentar comprar quando esgotado
      expect(() => {
        tipoIngressoService.reduzirEstoque(tipoIngresso.id!, 1);
      }).toThrow("Ingressos esgotados");
    });

    test("deve verificar corretamente a disponibilidade", () => {
      const dadosTipoIngresso = {
        eventoId: 1,
        nome: "Ingresso Teste",
        preco: 75.0,
        quantidadeInicial: 10,
      };

      const tipoIngresso =
        tipoIngressoService.criarTipoIngresso(dadosTipoIngresso);

      // Verificar disponibilidade antes de qualquer compra
      expect(
        tipoIngressoService.verificarDisponibilidade(tipoIngresso.id!, 5)
      ).toBe(true);
      expect(
        tipoIngressoService.verificarDisponibilidade(tipoIngresso.id!, 10)
      ).toBe(true);
      expect(
        tipoIngressoService.verificarDisponibilidade(tipoIngresso.id!, 15)
      ).toBe(false);

      // Reduzir estoque
      tipoIngressoService.reduzirEstoque(tipoIngresso.id!, 7);

      // Verificar disponibilidade após redução
      expect(
        tipoIngressoService.verificarDisponibilidade(tipoIngresso.id!, 3)
      ).toBe(true);
      expect(
        tipoIngressoService.verificarDisponibilidade(tipoIngresso.id!, 5)
      ).toBe(false);
    });
  });

  describe("Redução de estoque", () => {
    test("deve reduzir estoque corretamente após compra válida", () => {
      const dadosTipoIngresso = {
        eventoId: 1,
        nome: "Ingresso Regular",
        preco: 80.0,
        quantidadeInicial: 20,
      };

      const tipoIngresso =
        tipoIngressoService.criarTipoIngresso(dadosTipoIngresso);

      const tipoAtualizado = tipoIngressoService.reduzirEstoque(
        tipoIngresso.id!,
        3
      );

      expect(tipoAtualizado.quantidadeDisponivel).toBe(17);
    });

    test("deve impedir redução quando quantidade solicitada é maior que disponível", () => {
      const dadosTipoIngresso = {
        eventoId: 1,
        nome: "Ingresso Escasso",
        preco: 120.0,
        quantidadeInicial: 5,
      };

      const tipoIngresso =
        tipoIngressoService.criarTipoIngresso(dadosTipoIngresso);

      expect(() => {
        tipoIngressoService.reduzirEstoque(tipoIngresso.id!, 10);
      }).toThrow("Quantidade solicitada maior que a disponível");
    });

    test("deve rejeitar operação em tipo de ingresso inexistente", () => {
      const idInexistente = 999;

      expect(() => {
        tipoIngressoService.reduzirEstoque(idInexistente, 1);
      }).toThrow("Tipo de ingresso não encontrado");

      expect(() => {
        tipoIngressoService.verificarDisponibilidade(idInexistente, 1);
      }).toThrow("Tipo de ingresso não encontrado");
    });
  });
});
