import { EventoService } from "../src/services/EventoService";

describe("EventoService", () => {
  let eventoService: EventoService;

  beforeEach(() => {
    eventoService = new EventoService();
  });

  describe("Criar evento com dados válidos", () => {
    test("deve criar um evento com todos os dados válidos", () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const dadosEvento = {
        nome: "Evento de Teste",
        data: dataFutura,
        capacidadeTotal: 100,
        local: "Centro de Convenções",
      };

      const evento = eventoService.criarEvento(dadosEvento);

      expect(evento).toBeDefined();
      expect(evento.id).toBeDefined();
      expect(evento.nome).toBe(dadosEvento.nome);
      expect(evento.data).toEqual(dadosEvento.data);
      expect(evento.capacidadeTotal).toBe(dadosEvento.capacidadeTotal);
      expect(evento.local).toBe(dadosEvento.local);
      expect(evento.criadoEm).toBeDefined();
    });

    test("deve atribuir IDs únicos para eventos diferentes", () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const dadosEvento1 = {
        nome: "Evento 1",
        data: dataFutura,
        capacidadeTotal: 100,
        local: "Local 1",
      };

      const dadosEvento2 = {
        nome: "Evento 2",
        data: dataFutura,
        capacidadeTotal: 200,
        local: "Local 2",
      };

      const evento1 = eventoService.criarEvento(dadosEvento1);
      const evento2 = eventoService.criarEvento(dadosEvento2);

      expect(evento1.id).not.toBe(evento2.id);
    });
  });

  describe("Rejeitar evento com data no passado", () => {
    test("deve rejeitar evento com data no passado", () => {
      const dataPassada = new Date();
      dataPassada.setDate(dataPassada.getDate() - 1);

      const dadosEvento = {
        nome: "Evento no Passado",
        data: dataPassada,
        capacidadeTotal: 100,
        local: "Centro de Convenções",
      };

      expect(() => {
        eventoService.criarEvento(dadosEvento);
      }).toThrow("Data do evento não pode ser no passado");
    });

    test("deve rejeitar evento com data de hoje no passado (considerando apenas a data)", () => {
      const hoje = new Date();
      hoje.setHours(hoje.getHours() - 1); // Uma hora atrás, mas ainda hoje

      const dadosEvento = {
        nome: "Evento Hoje",
        data: hoje,
        capacidadeTotal: 100,
        local: "Centro de Convenções",
      };

      // Se for o mesmo dia, deve permitir
      expect(() => {
        eventoService.criarEvento(dadosEvento);
      }).not.toThrow();
    });
  });

  describe("Impedir redução de capacidade abaixo do número já vendido", () => {
    test("deve permitir redução de capacidade quando há espaço suficiente", () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const dadosEvento = {
        nome: "Evento de Teste",
        data: dataFutura,
        capacidadeTotal: 100,
        local: "Centro de Convenções",
      };

      const evento = eventoService.criarEvento(dadosEvento);
      const ingressosVendidos = 30;
      const novaCapacidade = 50;

      const eventoAtualizado = eventoService.atualizarCapacidade(
        evento.id!,
        novaCapacidade,
        ingressosVendidos
      );

      expect(eventoAtualizado.capacidadeTotal).toBe(novaCapacidade);
    });

    test("deve impedir redução de capacidade abaixo do número de ingressos vendidos", () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const dadosEvento = {
        nome: "Evento de Teste",
        data: dataFutura,
        capacidadeTotal: 100,
        local: "Centro de Convenções",
      };

      const evento = eventoService.criarEvento(dadosEvento);
      const ingressosVendidos = 50;
      const novaCapacidade = 30; // Menor que os ingressos vendidos

      expect(() => {
        eventoService.atualizarCapacidade(
          evento.id!,
          novaCapacidade,
          ingressosVendidos
        );
      }).toThrow(
        "Não é possível reduzir a capacidade abaixo do número de ingressos já vendidos"
      );
    });

    test("deve permitir capacidade igual ao número de ingressos vendidos", () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const dadosEvento = {
        nome: "Evento de Teste",
        data: dataFutura,
        capacidadeTotal: 100,
        local: "Centro de Convenções",
      };

      const evento = eventoService.criarEvento(dadosEvento);
      const ingressosVendidos = 50;
      const novaCapacidade = 50; // Igual aos ingressos vendidos

      const eventoAtualizado = eventoService.atualizarCapacidade(
        evento.id!,
        novaCapacidade,
        ingressosVendidos
      );

      expect(eventoAtualizado.capacidadeTotal).toBe(novaCapacidade);
    });

    test("deve rejeitar atualização de evento inexistente", () => {
      const idInexistente = 999;
      const ingressosVendidos = 10;
      const novaCapacidade = 20;

      expect(() => {
        eventoService.atualizarCapacidade(
          idInexistente,
          novaCapacidade,
          ingressosVendidos
        );
      }).toThrow("Evento não encontrado");
    });
  });
});
