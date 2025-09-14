import { Request, Response } from 'express';
import { ModeloIngresso } from '../modelos/ModeloIngresso';
import { ModeloEvento } from '../modelos/ModeloEvento';
import { ComprarIngressoDto, ValidarIngressoDto, RespostaValidacao } from '../tipos';

export class ControladorIngressos {
  static async comprarIngresso(req: Request, res: Response): Promise<void> {
    try {
      const dadosCompra: ComprarIngressoDto = req.body;

      // Validações básicas
      if (!dadosCompra.eventoId || !dadosCompra.tipoIngressoId || !dadosCompra.quantidade) {
        res.status(400).json({
          mensagem: 'Evento, tipo de ingresso e quantidade são obrigatórios'
        });
        return;
      }

      if (dadosCompra.quantidade <= 0) {
        res.status(400).json({
          mensagem: 'Quantidade deve ser maior que zero'
        });
        return;
      }

      if (!dadosCompra.comprador.nome || !dadosCompra.comprador.email) {
        res.status(400).json({
          mensagem: 'Nome e email do comprador são obrigatórios'
        });
        return;
      }

      // Verificar se o evento existe
      const evento = await ModeloEvento.buscarPorId(dadosCompra.eventoId);
      if (!evento) {
        res.status(404).json({
          mensagem: 'Evento não encontrado'
        });
        return;
      }

      // Verificar se o tipo de ingresso existe e pertence ao evento
      const tipoIngresso = await ModeloEvento.buscarTipoIngresso(dadosCompra.tipoIngressoId);
      if (!tipoIngresso || tipoIngresso.eventoId !== dadosCompra.eventoId) {
        res.status(404).json({
          mensagem: 'Tipo de ingresso não encontrado para este evento'
        });
        return;
      }

      // Verificar disponibilidade
      const disponivel = await ModeloEvento.verificarDisponibilidade(
        dadosCompra.tipoIngressoId, 
        dadosCompra.quantidade
      );

      if (!disponivel) {
        res.status(400).json({
          mensagem: 'Não há ingressos suficientes disponíveis'
        });
        return;
      }

      // Verificar se a data do evento já passou
      if (evento.data <= new Date()) {
        res.status(400).json({
          mensagem: 'Não é possível comprar ingressos para eventos que já aconteceram'
        });
        return;
      }

      // Criar os ingressos
      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra, 
        dadosCompra.tipoIngressoId, 
        dadosCompra.eventoId
      );

      // Atualizar quantidade vendida
      await ModeloEvento.atualizarQuantidadeVendida(
        dadosCompra.tipoIngressoId, 
        dadosCompra.quantidade
      );

      const valorTotal = tipoIngresso.preco * dadosCompra.quantidade;

      res.status(201).json({
        mensagem: 'Ingressos comprados com sucesso',
        ingressos,
        valorTotal,
        evento: {
          nome: evento.nome,
          data: evento.data,
          local: evento.local
        }
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao comprar ingresso'
      });
    }
  }

  static async listarIngressosComprador(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          mensagem: 'Email do comprador é obrigatório'
        });
        return;
      }

      const ingressos = await ModeloIngresso.buscarPorComprador(email);
      
      // Buscar informações dos eventos para cada ingresso
      const ingressosComEventos = await Promise.all(
        ingressos.map(async (ingresso) => {
          const evento = await ModeloEvento.buscarPorId(ingresso.eventoId);
          const tipoIngresso = await ModeloEvento.buscarTipoIngresso(ingresso.tipoIngressoId);
          
          return {
            ...ingresso,
            evento: evento ? {
              nome: evento.nome,
              data: evento.data,
              local: evento.local
            } : null,
            tipoIngresso: tipoIngresso ? {
              nome: tipoIngresso.nome,
              preco: tipoIngresso.preco
            } : null
          };
        })
      );

      res.json(ingressosComEventos);
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao listar ingressos'
      });
    }
  }

  static async validarIngresso(req: Request, res: Response): Promise<void> {
    try {
      const { codigoQr }: ValidarIngressoDto = req.body;

      if (!codigoQr) {
        res.status(400).json({
          mensagem: 'Código QR é obrigatório'
        });
        return;
      }

      const resultadoValidacao = await ModeloIngresso.validarIngresso(codigoQr);

      if (!resultadoValidacao.valido) {
        const resposta: RespostaValidacao = {
          valido: false,
          mensagem: resultadoValidacao.motivo || 'Ingresso inválido'
        };

        res.status(400).json(resposta);
        return;
      }

      const ingresso = resultadoValidacao.ingresso!;
      const evento = await ModeloEvento.buscarPorId(ingresso.eventoId);

      if (!evento) {
        res.status(404).json({
          valido: false,
          mensagem: 'Evento não encontrado'
        });
        return;
      }

      // Marcar ingresso como usado
      await ModeloIngresso.marcarComoUsado(ingresso.id);

      const resposta: RespostaValidacao = {
        valido: true,
        ingresso,
        evento,
        mensagem: 'Ingresso válido - Entrada autorizada'
      };

      res.json(resposta);
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao validar ingresso'
      });
    }
  }

  static async buscarIngresso(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const ingresso = await ModeloIngresso.buscarPorId(id);

      if (!ingresso) {
        res.status(404).json({
          mensagem: 'Ingresso não encontrado'
        });
        return;
      }

      // Buscar informações do evento
      const evento = await ModeloEvento.buscarPorId(ingresso.eventoId);
      const tipoIngresso = await ModeloEvento.buscarTipoIngresso(ingresso.tipoIngressoId);

      res.json({
        ...ingresso,
        evento: evento ? {
          nome: evento.nome,
          data: evento.data,
          local: evento.local
        } : null,
        tipoIngresso: tipoIngresso ? {
          nome: tipoIngresso.nome,
          preco: tipoIngresso.preco
        } : null
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao buscar ingresso'
      });
    }
  }

  static async estatisticasEvento(req: Request, res: Response): Promise<void> {
    try {
      const { eventoId } = req.params;
      const organizadorId = req.user?.id;

      if (!organizadorId) {
        res.status(401).json({
          mensagem: 'Usuário não autenticado'
        });
        return;
      }

      // Verificar se o evento existe e pertence ao organizador
      const evento = await ModeloEvento.buscarPorId(eventoId);
      if (!evento) {
        res.status(404).json({
          mensagem: 'Evento não encontrado'
        });
        return;
      }

      if (evento.organizadorId !== organizadorId) {
        res.status(403).json({
          mensagem: 'Você não tem permissão para ver estatísticas deste evento'
        });
        return;
      }

      const totalVendidos = await ModeloIngresso.contarIngressosVendidos(eventoId);
      const totalUsados = await ModeloIngresso.contarIngressosUsados(eventoId);

      res.json({
        evento: {
          nome: evento.nome,
          data: evento.data,
          capacidadeMaxima: evento.capacidadeMaxima
        },
        estatisticas: {
          ingressosVendidos: totalVendidos,
          ingressosUsados: totalUsados,
          ingressosDisponiveis: evento.capacidadeMaxima - totalVendidos,
          percentualOcupacao: (totalVendidos / evento.capacidadeMaxima) * 100,
          percentualCheckIn: totalVendidos > 0 ? (totalUsados / totalVendidos) * 100 : 0
        }
      });
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro ao buscar estatísticas'
      });
    }
  }
}
