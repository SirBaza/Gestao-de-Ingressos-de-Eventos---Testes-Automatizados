import { EventoService } from "../src/services/EventoService";
import { TipoIngressoService } from "../src/services/TipoIngressoService";
import { CompraService } from "../src/services/CompraService";
import { IngressoService } from "../src/services/IngressoService";

describe("Integração - Fluxo Completo do Sistema", () => {
  let eventoService: EventoService;
  let tipoIngressoService: TipoIngressoService;
  let compraService: CompraService;
  let ingressoService: IngressoService;

  beforeEach(() => {
    eventoService = new EventoService();
    tipoIngressoService = new TipoIngressoService();
    compraService = new CompraService();
    ingressoService = new IngressoService();
  });

  describe("Fluxo completo: Evento → Tipo de Ingresso → Compra → Ingresso → Validação", () => {
    test("deve processar fluxo completo com sucesso", () => {
      // 1. Criar evento
      const dataEvento = new Date();
      dataEvento.setDate(dataEvento.getDate() + 30);

      const evento = eventoService.criarEvento({
        nome: "Festival de Tecnologia 2023",
        data: dataEvento,
        capacidadeTotal: 100,
        local: "Centro de Convenções",
      });

      expect(evento.id).toBeDefined();

      // 2. Criar tipos de ingresso
      const tipoVIP = tipoIngressoService.criarTipoIngresso({
        eventoId: evento.id!,
        nome: "VIP",
        preco: 200.0,
        quantidadeInicial: 20,
      });

      const tipoComum = tipoIngressoService.criarTipoIngresso({
        eventoId: evento.id!,
        nome: "Comum",
        preco: 100.0,
        quantidadeInicial: 80,
      });

      expect(tipoVIP.quantidadeDisponivel).toBe(20);
      expect(tipoComum.quantidadeDisponivel).toBe(80);

      // 3. Verificar disponibilidade antes da compra
      expect(tipoIngressoService.verificarDisponibilidade(tipoVIP.id!, 2)).toBe(
        true
      );

      // 4. Criar compra
      const dadosCompra = {
        eventoId: evento.id!,
        tipoIngressoId: tipoVIP.id!,
        nome: "João Silva",
        email: "joao.silva@email.com",
        matricula: "2021001",
        quantidade: 2,
        valorTotal: 400.0,
      };

      const compra = compraService.criarCompra(dadosCompra);
      expect(compra.id).toBeDefined();

      // 5. Reduzir estoque após compra
      const tipoAtualizado = tipoIngressoService.reduzirEstoque(tipoVIP.id!, 2);
      expect(tipoAtualizado.quantidadeDisponivel).toBe(18);

      // 6. Criar ingressos individuais para a compra
      const payloadBase = {
        eventoId: evento.id!,
        tipoIngressoId: tipoVIP.id!,
        compraId: compra.id!,
        usuario: {
          nome: dadosCompra.nome,
          email: dadosCompra.email,
          matricula: dadosCompra.matricula,
        },
        evento: {
          nome: evento.nome,
          data: evento.data.toISOString(),
          local: evento.local,
        },
      };

      const ingresso1 = ingressoService.criarIngresso(compra.id!, {
        ...payloadBase,
        ingressoId: 1,
      });

      const ingresso2 = ingressoService.criarIngresso(compra.id!, {
        ...payloadBase,
        ingressoId: 2,
      });

      expect(ingresso1.hash).not.toBe(ingresso2.hash);
      expect(ingresso1.usado).toBe(false);
      expect(ingresso2.usado).toBe(false);

      // 7. Validar ingressos no evento
      const validacao1 = ingressoService.validarIngresso(ingresso1.hash);
      expect(validacao1.valido).toBe(true);
      expect(validacao1.ingresso!.usado).toBe(true);

      const validacao2 = ingressoService.validarIngresso(ingresso2.hash);
      expect(validacao2.valido).toBe(true);
      expect(validacao2.ingresso!.usado).toBe(true);

      // 8. Tentar validar novamente (deve falhar)
      const revalidacao1 = ingressoService.validarIngresso(ingresso1.hash);
      expect(revalidacao1.valido).toBe(false);
      expect(revalidacao1.mensagem).toBe("Ingresso já utilizado");
    });

    test("deve impedir compra quando capacidade total do evento é atingida", () => {
      // Criar evento com capacidade pequena
      const dataEvento = new Date();
      dataEvento.setDate(dataEvento.getDate() + 15);

      const evento = eventoService.criarEvento({
        nome: "Evento Limitado",
        data: dataEvento,
        capacidadeTotal: 5,
        local: "Sala Pequena",
      });

      // Criar tipo de ingresso
      const tipoIngresso = tipoIngressoService.criarTipoIngresso({
        eventoId: evento.id!,
        nome: "Único",
        preco: 50.0,
        quantidadeInicial: 10, // Mais que a capacidade do evento
      });

      // Simular vendas até atingir capacidade do evento
      const compra1 = compraService.criarCompra({
        eventoId: evento.id!,
        tipoIngressoId: tipoIngresso.id!,
        nome: "Comprador 1",
        email: "comprador1@email.com",
        matricula: "2021001",
        quantidade: 3,
        valorTotal: 150.0,
      });

      const compra2 = compraService.criarCompra({
        eventoId: evento.id!,
        tipoIngressoId: tipoIngresso.id!,
        nome: "Comprador 2",
        email: "comprador2@email.com",
        matricula: "2021002",
        quantidade: 2,
        valorTotal: 100.0,
      });

      // Verificar total vendido
      const totalVendido = compraService.calcularTotalIngressosVendidos(
        evento.id!
      );
      expect(totalVendido).toBe(5); // Capacidade máxima atingida

      // Tentar reduzir capacidade abaixo do vendido (deve falhar)
      expect(() => {
        eventoService.atualizarCapacidade(evento.id!, 3, totalVendido);
      }).toThrow(
        "Não é possível reduzir a capacidade abaixo do número de ingressos já vendidos"
      );

      // Reduzir estoque do tipo
      tipoIngressoService.reduzirEstoque(tipoIngresso.id!, 5);
      expect(
        tipoIngressoService.buscarTipoIngressoPorId(tipoIngresso.id!)!
          .quantidadeDisponivel
      ).toBe(5);
    });

    test("deve rejeitar compra quando quantidade solicitada é maior que disponível", () => {
      const dataEvento = new Date();
      dataEvento.setDate(dataEvento.getDate() + 20);

      const evento = eventoService.criarEvento({
        nome: "Evento Escasso",
        data: dataEvento,
        capacidadeTotal: 100,
        local: "Teatro",
      });

      const tipoLimitado = tipoIngressoService.criarTipoIngresso({
        eventoId: evento.id!,
        nome: "Limitado",
        preco: 75.0,
        quantidadeInicial: 3,
      });

      // Tentar comprar mais que o disponível
      expect(() => {
        tipoIngressoService.reduzirEstoque(tipoLimitado.id!, 5);
      }).toThrow("Quantidade solicitada maior que a disponível");

      // Verificar que o estoque não foi alterado
      expect(
        tipoIngressoService.buscarTipoIngressoPorId(tipoLimitado.id!)!
          .quantidadeDisponivel
      ).toBe(3);
    });

    test("deve validar todos os campos obrigatórios na compra", () => {
      const dataEvento = new Date();
      dataEvento.setDate(dataEvento.getDate() + 25);

      const evento = eventoService.criarEvento({
        nome: "Evento Validação",
        data: dataEvento,
        capacidadeTotal: 50,
        local: "Auditório",
      });

      const tipoIngresso = tipoIngressoService.criarTipoIngresso({
        eventoId: evento.id!,
        nome: "Padrão",
        preco: 60.0,
        quantidadeInicial: 30,
      });

      // Teste de cada campo obrigatório
      const dadosBase = {
        eventoId: evento.id!,
        tipoIngressoId: tipoIngresso.id!,
        nome: "Teste Usuario",
        email: "teste@email.com",
        matricula: "2021003",
        quantidade: 1,
        valorTotal: 60.0,
      };

      // Nome vazio
      expect(() => {
        compraService.criarCompra({ ...dadosBase, nome: "" });
      }).toThrow("Nome é obrigatório");

      // E-mail vazio
      expect(() => {
        compraService.criarCompra({ ...dadosBase, email: "" });
      }).toThrow("E-mail é obrigatório");

      // Matrícula vazia
      expect(() => {
        compraService.criarCompra({ ...dadosBase, matricula: "" });
      }).toThrow("Matrícula é obrigatória");

      // E-mail inválido
      expect(() => {
        compraService.criarCompra({ ...dadosBase, email: "email-invalido" });
      }).toThrow("E-mail deve ter formato válido");

      // Dados válidos devem passar
      expect(() => {
        compraService.criarCompra(dadosBase);
      }).not.toThrow();
    });
  });

  describe("Cenários de erro e edge cases", () => {
    test("deve rejeitar evento com data no passado", () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 5);

      expect(() => {
        eventoService.criarEvento({
          nome: "Evento no Passado",
          data: dataPassada,
          capacidadeTotal: 100,
          local: "Local Qualquer",
        });
      }).toThrow("Data do evento não pode ser no passado");
    });

    test("deve impedir compra quando ingressos esgotados", () => {
      const dataEvento = new Date();
      dataEvento.setDate(dataEvento.getDate() + 10);

      const evento = eventoService.criarEvento({
        nome: "Evento Esgotado",
        data: dataEvento,
        capacidadeTotal: 100,
        local: "Espaço",
      });

      const tipoEsgotavel = tipoIngressoService.criarTipoIngresso({
        eventoId: evento.id!,
        nome: "Esgotável",
        preco: 40.0,
        quantidadeInicial: 2,
      });

      // Esgotar estoque
      tipoIngressoService.reduzirEstoque(tipoEsgotavel.id!, 2);

      // Tentar comprar quando esgotado
      expect(() => {
        tipoIngressoService.reduzirEstoque(tipoEsgotavel.id!, 1);
      }).toThrow("Ingressos esgotados");
    });

    test("deve manter integridade dos hashes entre múltiplos ingressos", () => {
      const evento = eventoService.criarEvento({
        nome: "Evento Hash",
        data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        capacidadeTotal: 10,
        local: "Local Hash",
      });

      const tipo = tipoIngressoService.criarTipoIngresso({
        eventoId: evento.id!,
        nome: "Hash Test",
        preco: 30.0,
        quantidadeInicial: 5,
      });

      const compra = compraService.criarCompra({
        eventoId: evento.id!,
        tipoIngressoId: tipo.id!,
        nome: "Hash User",
        email: "hash@test.com",
        matricula: "2021999",
        quantidade: 3,
        valorTotal: 90.0,
      });

      // Criar múltiplos ingressos
      const ingressos = [];
      for (let i = 1; i <= 3; i++) {
        const payload = {
          ingressoId: i,
          compraId: compra.id!,
          sequencia: i,
        };
        ingressos.push(ingressoService.criarIngresso(compra.id!, payload));
      }

      // Verificar que todos têm hashes únicos
      const hashes = ingressos.map((i) => i.hash);
      const hashesUnicos = new Set(hashes);
      expect(hashesUnicos.size).toBe(3);

      // Validar cada ingresso independentemente
      ingressos.forEach((ingresso) => {
        const validacao = ingressoService.validarIngresso(ingresso.hash);
        expect(validacao.valido).toBe(true);
      });

      // Verificar que todos foram marcados como usados
      ingressos.forEach((ingresso) => {
        const revalidacao = ingressoService.validarIngresso(ingresso.hash);
        expect(revalidacao.valido).toBe(false);
        expect(revalidacao.mensagem).toBe("Ingresso já utilizado");
      });
    });
  });
});
