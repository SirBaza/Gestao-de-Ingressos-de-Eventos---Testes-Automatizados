import { Request, Response } from 'express';
import { CriarEventoUseCase } from '../domain/usecases/criar-evento-usecase';

export class CriarEventoController {
  constructor(
    private criarEventoUseCase: CriarEventoUseCase
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { nome, data, local, capacidadeMaxima, organizadorId, descricao } = request.body;

      // Validações básicas
      if (!nome || !data || !local || !capacidadeMaxima || !organizadorId) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Dados obrigatórios não fornecidos',
          erro: 'Nome, data, local, capacidade máxima e organizador são obrigatórios'
        });
      }

      // Converter string de data para Date
      const dataEvento = new Date(data);
      if (isNaN(dataEvento.getTime())) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Data inválida',
          erro: 'Formato de data inválido'
        });
      }

      const resultado = await this.criarEventoUseCase.executar({
        nome,
        data: dataEvento,
        local,
        capacidadeMaxima: Number(capacidadeMaxima),
        organizadorId,
        descricao
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
        evento: resultado.evento.toJSON()
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
