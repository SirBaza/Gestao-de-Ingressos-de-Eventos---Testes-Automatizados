import { Compra } from '../entities/compra';
import { CompraRepository, EventoRepository } from '../repositories';

export interface ValidarIngressoRequest {
  codigoQR: string;
}

export interface ValidarIngressoResponse {
  compra: Compra | null;
  valido: boolean;
  jaUtilizado: boolean;
  sucesso: boolean;
  mensagem: string;
  dadosParticipante?: {
    nome: string;
    documento: string;
    nomeEvento: string;
    tipoIngresso: string;
  };
}

export class ValidarIngressoUseCase {
  constructor(
    private compraRepository: CompraRepository,
    private eventoRepository: EventoRepository
  ) {}

  async executar(request: ValidarIngressoRequest): Promise<ValidarIngressoResponse> {
    try {
      // Buscar compra pelo código QR
      const compra = await this.compraRepository.buscarPorCodigoQR(request.codigoQR);
      
      if (!compra) {
        return {
          compra: null,
          valido: false,
          jaUtilizado: false,
          sucesso: false,
          mensagem: 'Código QR inválido ou não encontrado'
        };
      }

      // Verificar se a compra foi confirmada
      if (!compra.isConfirmada() && !compra.isUtilizada()) {
        return {
          compra,
          valido: false,
          jaUtilizado: false,
          sucesso: false,
          mensagem: 'Ingresso não foi confirmado ou está cancelado'
        };
      }

      // Verificar se já foi utilizado
      if (compra.isUtilizada()) {
        return {
          compra,
          valido: true,
          jaUtilizado: true,
          sucesso: false,
          mensagem: 'Este ingresso já foi utilizado para entrada'
        };
      }

      // Validar hash de segurança
      if (!this.validarHashSeguranca(compra)) {
        return {
          compra,
          valido: false,
          jaUtilizado: false,
          sucesso: false,
          mensagem: 'Código de segurança inválido - possível falsificação'
        };
      }

      // Buscar evento para verificar se ainda está válido
      const evento = await this.eventoRepository.buscarPorId(compra.eventoId);
      if (!evento) {
        return {
          compra,
          valido: false,
          jaUtilizado: false,
          sucesso: false,
          mensagem: 'Evento não encontrado'
        };
      }

      // Verificar se o evento já foi finalizado ou cancelado
      if (evento.status === 'cancelado') {
        return {
          compra,
          valido: false,
          jaUtilizado: false,
          sucesso: false,
          mensagem: 'Evento foi cancelado'
        };
      }

      // Marcar ingresso como utilizado
      compra.utilizarIngresso();
      await this.compraRepository.atualizar(compra);

      return {
        compra,
        valido: true,
        jaUtilizado: false,
        sucesso: true,
        mensagem: 'Ingresso válido - entrada autorizada',
        dadosParticipante: {
          nome: 'Nome do Participante', // Seria buscado do usuário
          documento: 'XXX.XXX.XXX-XX', // Seria buscado do usuário
          nomeEvento: evento.nome,
          tipoIngresso: 'Tipo do Ingresso' // Seria buscado do ingresso
        }
      };

    } catch (error) {
      return {
        compra: null,
        valido: false,
        jaUtilizado: false,
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido ao validar ingresso'
      };
    }
  }

  private validarHashSeguranca(compra: Compra): boolean {
    // Validação simples do hash de segurança
    // Em um ambiente real, seria feita uma validação mais robusta
    return !!(compra.hashSeguranca && compra.hashSeguranca.length > 10);
  }
}
