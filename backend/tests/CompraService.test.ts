import { CompraService } from "../src/services/CompraService";

describe("CompraService", () => {
  let compraService: CompraService;

  beforeEach(() => {
    compraService = new CompraService();
  });

  describe("Criar compra válida", () => {
    test("deve criar compra com todos os dados válidos", () => {
      const dadosCompra = {
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "João Silva",
        email: "joao.silva@email.com",
        matricula: "2021001",
        quantidade: 2,
        valorTotal: 160.0,
      };

      const compra = compraService.criarCompra(dadosCompra);

      expect(compra).toBeDefined();
      expect(compra.id).toBeDefined();
      expect(compra.eventoId).toBe(dadosCompra.eventoId);
      expect(compra.tipoIngressoId).toBe(dadosCompra.tipoIngressoId);
      expect(compra.nome).toBe(dadosCompra.nome);
      expect(compra.email).toBe(dadosCompra.email);
      expect(compra.matricula).toBe(dadosCompra.matricula);
      expect(compra.quantidade).toBe(dadosCompra.quantidade);
      expect(compra.valorTotal).toBe(dadosCompra.valorTotal);
      expect(compra.criadoEm).toBeDefined();
    });

    test("deve atribuir IDs únicos para compras diferentes", () => {
      const dadosCompra1 = {
        eventoId: 1,
        tipoIngressoId: 1,
        nome: "Maria Santos",
        email: "maria.santos@email.com",
        matricula: "2021002",
        quantidade: 1,
        valorTotal: 80.0,
      };

      const dadosCompra2 = {
        eventoId: 1,
        tipoIngressoId: 2,
        nome: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        matricula: "2021003",
        quantidade: 3,
        valorTotal: 240.0,
      };

      const compra1 = compraService.criarCompra(dadosCompra1);
      const compra2 = compraService.criarCompra(dadosCompra2);

      expect(compra1.id).not.toBe(compra2.id);
    });
  });

  describe("Validar campos obrigatórios", () => {
    const dadosBase = {
      eventoId: 1,
      tipoIngressoId: 1,
      nome: "Ana Costa",
      email: "ana.costa@email.com",
      matricula: "2021004",
      quantidade: 1,
      valorTotal: 80.0,
    };

    test("deve rejeitar compra sem nome", () => {
      const dadosInvalidos = { ...dadosBase, nome: "" };

      expect(() => {
        compraService.criarCompra(dadosInvalidos);
      }).toThrow("Nome é obrigatório");
    });

    test("deve rejeitar compra com nome apenas com espaços", () => {
      const dadosInvalidos = { ...dadosBase, nome: "   " };

      expect(() => {
        compraService.criarCompra(dadosInvalidos);
      }).toThrow("Nome é obrigatório");
    });

    test("deve rejeitar compra sem e-mail", () => {
      const dadosInvalidos = { ...dadosBase, email: "" };

      expect(() => {
        compraService.criarCompra(dadosInvalidos);
      }).toThrow("E-mail é obrigatório");
    });

    test("deve rejeitar compra com e-mail apenas com espaços", () => {
      const dadosInvalidos = { ...dadosBase, email: "   " };

      expect(() => {
        compraService.criarCompra(dadosInvalidos);
      }).toThrow("E-mail é obrigatório");
    });

    test("deve rejeitar compra sem matrícula", () => {
      const dadosInvalidos = { ...dadosBase, matricula: "" };

      expect(() => {
        compraService.criarCompra(dadosInvalidos);
      }).toThrow("Matrícula é obrigatória");
    });

    test("deve rejeitar compra com matrícula apenas com espaços", () => {
      const dadosInvalidos = { ...dadosBase, matricula: "   " };

      expect(() => {
        compraService.criarCompra(dadosInvalidos);
      }).toThrow("Matrícula é obrigatória");
    });

    test("deve rejeitar e-mail com formato inválido", () => {
      const emailsInvalidos = [
        "email-sem-arroba.com",
        "email@",
        "@dominio.com",
        "email@dominio",
        "email.com",
      ];

      emailsInvalidos.forEach((emailInvalido, index) => {
        const dadosInvalidos = {
          ...dadosBase,
          email: emailInvalido,
          matricula: `2021${100 + index}`, // Matrícula única para cada teste
        };

        expect(() => {
          compraService.criarCompra(dadosInvalidos);
        }).toThrow("E-mail deve ter formato válido");
      });
    });

    test("deve aceitar e-mails com formato válido", () => {
      const emailsValidos = [
        "usuario@dominio.com",
        "usuario.sobrenome@dominio.com.br",
        "usuario+tag@dominio.org",
        "usuario123@dominio123.net",
      ];

      emailsValidos.forEach((emailValido) => {
        const dadosValidos = {
          ...dadosBase,
          email: emailValido,
          matricula: `2021${Math.random().toString().substr(2, 3)}`, // Matrícula única
        };

        expect(() => {
          compraService.criarCompra(dadosValidos);
        }).not.toThrow();
      });
    });
  });

  describe("Cálculo de ingressos vendidos", () => {
    test("deve calcular corretamente o total de ingressos vendidos para um evento", () => {
      const eventoId = 1;

      // Criar várias compras para o mesmo evento
      compraService.criarCompra({
        eventoId,
        tipoIngressoId: 1,
        nome: "Comprador 1",
        email: "comprador1@email.com",
        matricula: "2021001",
        quantidade: 2,
        valorTotal: 160.0,
      });

      compraService.criarCompra({
        eventoId,
        tipoIngressoId: 2,
        nome: "Comprador 2",
        email: "comprador2@email.com",
        matricula: "2021002",
        quantidade: 3,
        valorTotal: 240.0,
      });

      compraService.criarCompra({
        eventoId: 2, // Evento diferente
        tipoIngressoId: 1,
        nome: "Comprador 3",
        email: "comprador3@email.com",
        matricula: "2021003",
        quantidade: 1,
        valorTotal: 80.0,
      });

      const totalVendido =
        compraService.calcularTotalIngressosVendidos(eventoId);

      expect(totalVendido).toBe(5); // 2 + 3 = 5 (não conta o do evento 2)
    });

    test("deve retornar zero quando não há compras para o evento", () => {
      const eventoSemCompras = 999;
      const total =
        compraService.calcularTotalIngressosVendidos(eventoSemCompras);

      expect(total).toBe(0);
    });
  });
});
