import { Request, Response } from 'express';
import { ListarEventosUseCase } from '../domain/usecases/listar-eventos-usecase';

export class ListarEventosController {
  constructor(
    private listarEventosUseCase: ListarEventosUseCase
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { organizadorId, status } = request.query;

      const resultado = await this.listarEventosUseCase.executar({
        organizadorId: organizadorId as string,
        status: status as 'ativo' | 'cancelado' | 'finalizado'
      });

      if (!resultado.sucesso) {
        return response.status(400).json({
          sucesso: false,
          mensagem: resultado.mensagem
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: resultado.mensagem,
        eventos: resultado.eventos.map(evento => evento.toJSON()),
        total: resultado.total
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
