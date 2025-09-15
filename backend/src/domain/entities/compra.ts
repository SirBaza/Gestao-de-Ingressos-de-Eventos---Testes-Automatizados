export interface CompraProps {
  id?: string;
  usuarioId: string;
  eventoId: string;
  ingressoId: string;
  quantidade: number;
  valorTotal: number;
  codigoQR: string;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'utilizada';
  hashSeguranca: string;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Compra {
  private props: CompraProps;

  constructor(props: CompraProps) {
    this.validarDados(props);
    this.props = {
      ...props,
      id: props.id || this.gerarId(),
      status: props.status || 'pendente',
      criadoEm: props.criadoEm || new Date(),
      atualizadoEm: props.atualizadoEm || new Date()
    };
  }

  private validarDados(props: CompraProps): void {
    if (!props.usuarioId) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!props.eventoId) {
      throw new Error('ID do evento é obrigatório');
    }

    if (!props.ingressoId) {
      throw new Error('ID do ingresso é obrigatório');
    }

    if (!props.quantidade || props.quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    if (!props.valorTotal || props.valorTotal < 0) {
      throw new Error('Valor total deve ser maior ou igual a zero');
    }

    if (!props.codigoQR) {
      throw new Error('Código QR é obrigatório');
    }

    if (!props.hashSeguranca) {
      throw new Error('Hash de segurança é obrigatório');
    }

    if (!['pendente', 'confirmada', 'cancelada', 'utilizada'].includes(props.status)) {
      throw new Error('Status inválido');
    }
  }

  private gerarId(): string {
    return 'compra_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  get id(): string {
    return this.props.id!;
  }

  get usuarioId(): string {
    return this.props.usuarioId;
  }

  get eventoId(): string {
    return this.props.eventoId;
  }

  get ingressoId(): string {
    return this.props.ingressoId;
  }

  get quantidade(): number {
    return this.props.quantidade;
  }

  get valorTotal(): number {
    return this.props.valorTotal;
  }

  get codigoQR(): string {
    return this.props.codigoQR;
  }

  get status(): 'pendente' | 'confirmada' | 'cancelada' | 'utilizada' {
    return this.props.status;
  }

  get hashSeguranca(): string {
    return this.props.hashSeguranca;
  }

  get criadoEm(): Date {
    return this.props.criadoEm!;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm!;
  }

  confirmarCompra(): void {
    if (this.props.status !== 'pendente') {
      throw new Error('Apenas compras pendentes podem ser confirmadas');
    }
    this.props.status = 'confirmada';
    this.props.atualizadoEm = new Date();
  }

  cancelarCompra(): void {
    if (this.props.status === 'utilizada') {
      throw new Error('Compras já utilizadas não podem ser canceladas');
    }
    this.props.status = 'cancelada';
    this.props.atualizadoEm = new Date();
  }

  utilizarIngresso(): void {
    if (this.props.status !== 'confirmada') {
      throw new Error('Apenas ingressos confirmados podem ser utilizados');
    }
    this.props.status = 'utilizada';
    this.props.atualizadoEm = new Date();
  }

  isUtilizada(): boolean {
    return this.props.status === 'utilizada';
  }

  isConfirmada(): boolean {
    return this.props.status === 'confirmada';
  }

  isPendente(): boolean {
    return this.props.status === 'pendente';
  }

  isCancelada(): boolean {
    return this.props.status === 'cancelada';
  }

  toJSON(): CompraProps {
    return { ...this.props };
  }
}
