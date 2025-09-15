import { Evento, EventoProps } from '../entities/evento';
import { EventoRepository } from '../repositories';

export interface CriarEventoRequest {
  nome: string;
  data: Date;
  local: string;
  capacidadeMaxima: number;
  organizadorId: string;
  descricao?: string;
}

export interface CriarEventoResponse {
  evento: Evento;
  sucesso: boolean;
  mensagem: string;
}

export class CriarEventoUseCase {
  constructor(
    private eventoRepository: EventoRepository
  ) {}

  async executar(request: CriarEventoRequest): Promise<CriarEventoResponse> {
    try {
      // Validações de negócio específicas
      if (request.data <= new Date()) {
        return {
          evento: null as any,
          sucesso: false,
          mensagem: 'A data do evento deve ser futura'
        };
      }

      // Criar evento
      const eventoProps: EventoProps = {
        nome: request.nome,
        data: request.data,
        local: request.local,
        capacidadeMaxima: request.capacidadeMaxima,
        organizadorId: request.organizadorId,
        descricao: request.descricao,
        status: 'ativo'
      };

      const evento = new Evento(eventoProps);

      // Salvar no repositório
      await this.eventoRepository.salvar(evento);

      return {
        evento,
        sucesso: true,
        mensagem: 'Evento criado com sucesso'
      };

    } catch (error) {
      return {
        evento: null as any,
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido ao criar evento'
      };
    }
  }
}
