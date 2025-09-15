import { Evento } from '../entities/evento';
import { EventoRepository } from '../repositories';

export interface ListarEventosRequest {
  organizadorId?: string;
  status?: 'ativo' | 'cancelado' | 'finalizado';
}

export interface ListarEventosResponse {
  eventos: Evento[];
  total: number;
  sucesso: boolean;
  mensagem: string;
}

export class ListarEventosUseCase {
  constructor(
    private eventoRepository: EventoRepository
  ) {}

  async executar(request?: ListarEventosRequest): Promise<ListarEventosResponse> {
    try {
      let eventos: Evento[];

      if (request?.organizadorId) {
        eventos = await this.eventoRepository.listarPorOrganizador(request.organizadorId);
      } else {
        eventos = await this.eventoRepository.listarTodos();
      }

      // Filtrar por status se especificado
      if (request?.status) {
        eventos = eventos.filter(evento => evento.status === request.status);
      }

      return {
        eventos,
        total: eventos.length,
        sucesso: true,
        mensagem: `${eventos.length} evento(s) encontrado(s)`
      };

    } catch (error) {
      return {
        eventos: [],
        total: 0,
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido ao listar eventos'
      };
    }
  }
}
