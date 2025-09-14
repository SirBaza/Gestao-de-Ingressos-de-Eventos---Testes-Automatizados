import { describe, test, expect, beforeEach } from 'vitest';
import { ModeloEvento } from '../src/modelos/ModeloEvento';
import { CriarEventoDto } from '../src/tipos';

describe('ModeloEvento', () => {
  beforeEach(() => {
    ModeloEvento.limparDados();
  });

  describe('criarEvento', () => {
    test('deve criar um evento válido com tipos de ingresso', async () => {
      const dadosEvento: CriarEventoDto = {
        nome: 'Show de Rock',
        descricao: 'Um incrível show de rock',
        data: '2024-12-31T20:00:00.000Z',
        local: 'Arena Principal',
        capacidadeMaxima: 1000,
        tiposIngresso: [
          {
            nome: 'Pista',
            preco: 50.0,
            quantidadeDisponivel: 800
          },
          {
            nome: 'VIP',
            preco: 150.0,
            quantidadeDisponivel: 200
          }
        ]
      };

      const organizadorId = 'organizador-123';
      const evento = await ModeloEvento.criarEvento(dadosEvento, organizadorId);

      expect(evento.id).toBeDefined();
      expect(evento.nome).toBe(dadosEvento.nome);
      expect(evento.descricao).toBe(dadosEvento.descricao);
      expect(evento.local).toBe(dadosEvento.local);
      expect(evento.capacidadeMaxima).toBe(dadosEvento.capacidadeMaxima);
      expect(evento.organizadorId).toBe(organizadorId);
      expect(evento.tiposIngresso).toHaveLength(2);
      expect(evento.tiposIngresso[0].nome).toBe('Pista');
      expect(evento.tiposIngresso[0].preco).toBe(50.0);
      expect(evento.tiposIngresso[1].nome).toBe('VIP');
      expect(evento.tiposIngresso[1].preco).toBe(150.0);
    });
  });

  describe('buscarPorId', () => {
    test('deve encontrar evento por ID', async () => {
      const dadosEvento: CriarEventoDto = {
        nome: 'Festival de Música',
        descricao: 'Festival com vários artistas',
        data: '2024-08-15T18:00:00.000Z',
        local: 'Parque da Cidade',
        capacidadeMaxima: 5000,
        tiposIngresso: [
          {
            nome: 'Inteira',
            preco: 80.0,
            quantidadeDisponivel: 5000
          }
        ]
      };

      const organizadorId = 'organizador-456';
      const eventoCriado = await ModeloEvento.criarEvento(dadosEvento, organizadorId);
      const evento = await ModeloEvento.buscarPorId(eventoCriado.id);

      expect(evento).toBeTruthy();
      expect(evento?.id).toBe(eventoCriado.id);
      expect(evento?.nome).toBe('Festival de Música');
      expect(evento?.tiposIngresso).toHaveLength(1);
    });

    test('deve retornar null para ID inexistente', async () => {
      const evento = await ModeloEvento.buscarPorId('id-inexistente');
      expect(evento).toBeNull();
    });
  });

  describe('listarEventos', () => {
    test('deve listar todos os eventos', async () => {
      const eventos = [
        {
          nome: 'Evento 1',
          descricao: 'Descrição do evento 1',
          data: '2024-06-01T19:00:00.000Z',
          local: 'Local 1',
          capacidadeMaxima: 100,
          tiposIngresso: [
            { nome: 'Normal', preco: 25.0, quantidadeDisponivel: 100 }
          ]
        },
        {
          nome: 'Evento 2',
          descricao: 'Descrição do evento 2',
          data: '2024-07-01T20:00:00.000Z',
          local: 'Local 2',
          capacidadeMaxima: 200,
          tiposIngresso: [
            { nome: 'Normal', preco: 30.0, quantidadeDisponivel: 200 }
          ]
        }
      ];

      const organizadorId = 'organizador-789';

      for (const dadosEvento of eventos) {
        await ModeloEvento.criarEvento(dadosEvento, organizadorId);
      }

      const listaEventos = await ModeloEvento.listarEventos();

      expect(listaEventos).toHaveLength(2);
      expect(listaEventos[0].nome).toBe('Evento 1');
      expect(listaEventos[1].nome).toBe('Evento 2');
    });

    test('deve retornar lista vazia quando não há eventos', async () => {
      const listaEventos = await ModeloEvento.listarEventos();
      expect(listaEventos).toHaveLength(0);
    });
  });

  describe('listarEventosPorOrganizador', () => {
    test('deve listar apenas eventos do organizador específico', async () => {
      const organizador1 = 'organizador-1';
      const organizador2 = 'organizador-2';

      const dadosEvento1: CriarEventoDto = {
        nome: 'Evento do Organizador 1',
        descricao: 'Evento criado pelo organizador 1',
        data: '2024-05-01T19:00:00.000Z',
        local: 'Local A',
        capacidadeMaxima: 100,
        tiposIngresso: [
          { nome: 'Comum', preco: 20.0, quantidadeDisponivel: 100 }
        ]
      };

      const dadosEvento2: CriarEventoDto = {
        nome: 'Evento do Organizador 2',
        descricao: 'Evento criado pelo organizador 2',
        data: '2024-05-02T19:00:00.000Z',
        local: 'Local B',
        capacidadeMaxima: 150,
        tiposIngresso: [
          { nome: 'Comum', preco: 25.0, quantidadeDisponivel: 150 }
        ]
      };

      await ModeloEvento.criarEvento(dadosEvento1, organizador1);
      await ModeloEvento.criarEvento(dadosEvento2, organizador2);
      await ModeloEvento.criarEvento(dadosEvento1, organizador1); // Mais um para organizador 1

      const eventosOrganizador1 = await ModeloEvento.listarEventosPorOrganizador(organizador1);
      const eventosOrganizador2 = await ModeloEvento.listarEventosPorOrganizador(organizador2);

      expect(eventosOrganizador1).toHaveLength(2);
      expect(eventosOrganizador2).toHaveLength(1);
      expect(eventosOrganizador1[0].organizadorId).toBe(organizador1);
      expect(eventosOrganizador2[0].organizadorId).toBe(organizador2);
    });
  });

  describe('verificarDisponibilidade', () => {
    test('deve verificar disponibilidade de ingressos', async () => {
      const dadosEvento: CriarEventoDto = {
        nome: 'Show Teste',
        descricao: 'Show para teste de disponibilidade',
        data: '2024-09-01T21:00:00.000Z',
        local: 'Casa de Shows',
        capacidadeMaxima: 300,
        tiposIngresso: [
          {
            nome: 'Comum',
            preco: 40.0,
            quantidadeDisponivel: 300
          }
        ]
      };

      const organizadorId = 'organizador-teste';
      const evento = await ModeloEvento.criarEvento(dadosEvento, organizadorId);
      const tipoIngressoId = evento.tiposIngresso[0].id;

      // Deve ter disponibilidade para 300 ingressos
      const disponivel300 = await ModeloEvento.verificarDisponibilidade(tipoIngressoId, 300);
      expect(disponivel300).toBe(true);

      // Não deve ter disponibilidade para 301 ingressos
      const disponivel301 = await ModeloEvento.verificarDisponibilidade(tipoIngressoId, 301);
      expect(disponivel301).toBe(false);

      // Simular venda de 100 ingressos
      await ModeloEvento.atualizarQuantidadeVendida(tipoIngressoId, 100);

      // Agora deve ter disponibilidade para 200 ingressos
      const disponivel200 = await ModeloEvento.verificarDisponibilidade(tipoIngressoId, 200);
      expect(disponivel200).toBe(true);

      // Mas não para 201 ingressos
      const disponivel201 = await ModeloEvento.verificarDisponibilidade(tipoIngressoId, 201);
      expect(disponivel201).toBe(false);
    });

    test('deve retornar false para tipo de ingresso inexistente', async () => {
      const disponivel = await ModeloEvento.verificarDisponibilidade('id-inexistente', 1);
      expect(disponivel).toBe(false);
    });
  });
});
