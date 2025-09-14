import { Request, Response } from 'express';
import { ModeloEvento } from '../modelos/ModeloEvento';
import { CriarEventoDto } from '../tipos';

export class ControladorEventos {
  static async criarEvento(req: Request, res: Response): Promise<void> {
    try {
      const dadosEvento: CriarEventoDto = req.body;
      const organizadorId = req.user?.id;

      if (!organizadorId) {
        res.status(401).json({
          mensagem: 'Usuário não autenticado'
        });
        return;
      }

      // Validações básicas
      if (!dadosEvento.nome || !dadosEvento.data || !dadosEvento.local) {
        res.status(400).json({
          mensagem: 'Nome, data e local são obrigatórios'
        });
        return;
      }

      if (dadosEvento.capacidadeMaxima <= 0) {
        res.status(400).json({
          mensagem: 'Capacidade máxima deve ser maior que zero'
        });
        return;
      }

      if (!dadosEvento.tiposIngresso || dadosEvento.tiposIngresso.length === 0) {
        res.status(400).json({
          mensagem: 'Pelo menos um tipo de ingresso deve ser definido'
        });
        return;
      }

      // Verificar se a data do evento é no futuro
      const dataEvento = new Date(dadosEvento.data);
      if (dataEvento <= new Date()) {
        res.status(400).json({
          mensagem: 'A data do evento deve ser no futuro'
        });
        return;
      }

      const evento = await ModeloEvento.criarEvento(dadosEvento, organizadorId);

      res.status(201).json({
        mensagem: 'Evento criado com sucesso',
        evento
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao criar evento'
      });
    }
  }

  static async listarEventos(req: Request, res: Response): Promise<void> {
    try {
      const eventos = await ModeloEvento.listarEventos();
      res.json(eventos);
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao listar eventos'
      });
    }
  }

  static async buscarEvento(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const evento = await ModeloEvento.buscarPorId(id);

      if (!evento) {
        res.status(404).json({
          mensagem: 'Evento não encontrado'
        });
        return;
      }

      res.json(evento);
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao buscar evento'
      });
    }
  }

  static async listarEventosOrganizador(req: Request, res: Response): Promise<void> {
    try {
      const organizadorId = req.user?.id;

      if (!organizadorId) {
        res.status(401).json({
          mensagem: 'Usuário não autenticado'
        });
        return;
      }

      const eventos = await ModeloEvento.listarEventosPorOrganizador(organizadorId);
      res.json(eventos);
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao listar eventos do organizador'
      });
    }
  }

  static async atualizarEvento(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;
      const organizadorId = req.user?.id;

      if (!organizadorId) {
        res.status(401).json({
          mensagem: 'Usuário não autenticado'
        });
        return;
      }

      // Verificar se o evento existe e pertence ao organizador
      const eventoExistente = await ModeloEvento.buscarPorId(id);
      if (!eventoExistente) {
        res.status(404).json({
          mensagem: 'Evento não encontrado'
        });
        return;
      }

      if (eventoExistente.organizadorId !== organizadorId) {
        res.status(403).json({
          mensagem: 'Você não tem permissão para atualizar este evento'
        });
        return;
      }

      const eventoAtualizado = await ModeloEvento.atualizar(id, dadosAtualizacao);

      res.json({
        mensagem: 'Evento atualizado com sucesso',
        evento: eventoAtualizado
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao atualizar evento'
      });
    }
  }

  static async removerEvento(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const organizadorId = req.user?.id;

      if (!organizadorId) {
        res.status(401).json({
          mensagem: 'Usuário não autenticado'
        });
        return;
      }

      // Verificar se o evento existe e pertence ao organizador
      const eventoExistente = await ModeloEvento.buscarPorId(id);
      if (!eventoExistente) {
        res.status(404).json({
          mensagem: 'Evento não encontrado'
        });
        return;
      }

      if (eventoExistente.organizadorId !== organizadorId) {
        res.status(403).json({
          mensagem: 'Você não tem permissão para remover este evento'
        });
        return;
      }

      const removido = await ModeloEvento.remover(id);

      if (removido) {
        res.json({
          mensagem: 'Evento removido com sucesso'
        });
      } else {
        res.status(500).json({
          mensagem: 'Erro ao remover evento'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao remover evento'
      });
    }
  }
}
