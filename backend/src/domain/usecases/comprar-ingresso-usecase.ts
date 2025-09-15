import { Compra, CompraProps } from '../entities/compra';
import { CompraRepository, IngressoRepository, EventoRepository, UsuarioRepository } from '../repositories';

export interface ComprarIngressoRequest {
  usuarioId: string;
  eventoId: string;
  ingressoId: string;
  quantidade: number;
}

export interface ComprarIngressoResponse {
  compra: Compra | null;
  sucesso: boolean;
  mensagem: string;
}

export class ComprarIngressoUseCase {
  constructor(
    private compraRepository: CompraRepository,
    private ingressoRepository: IngressoRepository,
    private eventoRepository: EventoRepository,
    private usuarioRepository: UsuarioRepository
  ) {}

  async executar(request: ComprarIngressoRequest): Promise<ComprarIngressoResponse> {
    try {
      // Validar se o usuário existe
      const usuario = await this.usuarioRepository.buscarPorId(request.usuarioId);
      if (!usuario) {
        return {
          compra: null,
          sucesso: false,
          mensagem: 'Usuário não encontrado'
        };
      }

      // Validar se o evento existe e está ativo
      const evento = await this.eventoRepository.buscarPorId(request.eventoId);
      if (!evento) {
        return {
          compra: null,
          sucesso: false,
          mensagem: 'Evento não encontrado'
        };
      }

      if (evento.status !== 'ativo') {
        return {
          compra: null,
          sucesso: false,
          mensagem: 'Evento não está ativo para compra de ingressos'
        };
      }

      // Validar se o ingresso existe e tem quantidade disponível
      const ingresso = await this.ingressoRepository.buscarPorId(request.ingressoId);
      if (!ingresso) {
        return {
          compra: null,
          sucesso: false,
          mensagem: 'Tipo de ingresso não encontrado'
        };
      }

      if (ingresso.quantidadeDisponivel < request.quantidade) {
        return {
          compra: null,
          sucesso: false,
          mensagem: `Apenas ${ingresso.quantidadeDisponivel} ingresso(s) disponível(is)`
        };
      }

      // Calcular valor total
      const valorTotal = ingresso.preco * request.quantidade;

      // Gerar código QR e hash de segurança
      const codigoQR = this.gerarCodigoQR(request);
      const hashSeguranca = this.gerarHashSeguranca(codigoQR, request);

      // Criar compra
      const compraProps: CompraProps = {
        usuarioId: request.usuarioId,
        eventoId: request.eventoId,
        ingressoId: request.ingressoId,
        quantidade: request.quantidade,
        valorTotal,
        codigoQR,
        hashSeguranca,
        status: 'confirmada' // Assumindo pagamento automático aprovado
      };

      const compra = new Compra(compraProps);

      // Reduzir quantidade disponível do ingresso
      ingresso.reduzirQuantidade(request.quantidade);

      // Salvar compra e atualizar ingresso
      await this.compraRepository.salvar(compra);
      await this.ingressoRepository.atualizar(ingresso);

      return {
        compra,
        sucesso: true,
        mensagem: 'Compra realizada com sucesso'
      };

    } catch (error) {
      return {
        compra: null,
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido ao processar compra'
      };
    }
  }

  private gerarCodigoQR(request: ComprarIngressoRequest): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `QR_${request.eventoId}_${request.usuarioId}_${timestamp}_${random}`;
  }

  private gerarHashSeguranca(codigoQR: string, request: ComprarIngressoRequest): string {
    // Hash simples baseado nos dados da compra
    const dados = `${codigoQR}_${request.usuarioId}_${request.eventoId}_${request.ingressoId}_${Date.now()}`;
    return Buffer.from(dados).toString('base64');
  }
}
