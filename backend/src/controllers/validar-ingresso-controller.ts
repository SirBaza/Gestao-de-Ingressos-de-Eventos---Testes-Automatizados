import { Request, Response } from 'express';
import { ValidarIngressoUseCase } from '../domain/usecases/validar-ingresso-usecase';

export class ValidarIngressoController {
  constructor(
    private validarIngressoUseCase: ValidarIngressoUseCase
  ) {}

  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { codigoQR } = request.body;

      // Validações básicas
      if (!codigoQR) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Código QR é obrigatório'
        });
      }

      const resultado = await this.validarIngressoUseCase.executar({
        codigoQR
      });

      // Se o ingresso já foi utilizado, retorna status 200 mas com informação
      if (resultado.jaUtilizado) {
        return response.status(200).json({
          sucesso: false,
          valido: resultado.valido,
          jaUtilizado: resultado.jaUtilizado,
          mensagem: resultado.mensagem,
          dadosParticipante: resultado.dadosParticipante
        });
      }

      // Se não é válido por outras razões, retorna 400
      if (!resultado.sucesso) {
        return response.status(400).json({
          sucesso: false,
          valido: resultado.valido,
          mensagem: resultado.mensagem
        });
      }

      // Ingresso válido e utilizado com sucesso
      return response.status(200).json({
        sucesso: true,
        valido: resultado.valido,
        jaUtilizado: resultado.jaUtilizado,
        mensagem: resultado.mensagem,
        dadosParticipante: resultado.dadosParticipante
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
