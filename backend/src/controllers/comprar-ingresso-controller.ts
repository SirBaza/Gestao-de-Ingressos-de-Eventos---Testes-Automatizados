import { Request, Response } from 'express';
import { ComprarIngressoUseCase } from '../domain/usecases/comprar-ingresso-usecase';

export class ComprarIngressoController {
  constructor(
    private comprarIngressoUseCase: ComprarIngressoUseCase
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { usuarioId, eventoId, ingressoId, quantidade } = request.body;

      // Validações básicas
      if (!usuarioId || !eventoId || !ingressoId || !quantidade) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Dados obrigatórios não fornecidos',
          erro: 'Usuário, evento, ingresso e quantidade são obrigatórios'
        });
      }

      const resultado = await this.comprarIngressoUseCase.executar({
        usuarioId,
        eventoId,
        ingressoId,
        quantidade: Number(quantidade)
      });

      if (!resultado.sucesso) {
        return response.status(400).json({
          sucesso: false,
          mensagem: resultado.mensagem
        });
      }

      return response.status(201).json({
        sucesso: true,
        mensagem: resultado.mensagem,
        compra: resultado.compra?.toJSON()
      });

    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno do servidor',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
