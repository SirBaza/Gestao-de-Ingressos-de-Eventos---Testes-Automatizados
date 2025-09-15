export interface EventoProps {
  id?: string;
  nome: string;
  data: Date;
  local: string;
  capacidadeMaxima: number;
  organizadorId: string;
  descricao?: string;
  status?: 'ativo' | 'cancelado' | 'finalizado';
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Evento {
  private props: EventoProps;

  constructor(props: EventoProps) {
    this.validarDados(props);
    this.props = {
      ...props,
      id: props.id || this.gerarId(),
      criadoEm: props.criadoEm || new Date(),
      atualizadoEm: props.atualizadoEm || new Date(),
      status: props.status || 'ativo'
    };
  }

  private validarDados(props: EventoProps): void {
    if (!props.nome || props.nome.trim().length < 3) {
      throw new Error('Nome do evento deve ter pelo menos 3 caracteres');
    }

    if (!props.data || props.data <= new Date()) {
      throw new Error('Data do evento deve ser futura');
    }

    if (!props.local || props.local.trim().length < 3) {
      throw new Error('Local do evento deve ter pelo menos 3 caracteres');
    }

    if (!props.capacidadeMaxima || props.capacidadeMaxima <= 0) {
      throw new Error('Capacidade máxima deve ser maior que zero');
    }

    if (!props.organizadorId) {
      throw new Error('ID do organizador é obrigatório');
    }
  }

  private gerarId(): string {
    return 'evento_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  get id(): string {
    return this.props.id!;
  }

  get nome(): string {
    return this.props.nome;
  }

  get data(): Date {
    return this.props.data;
  }

  get local(): string {
    return this.props.local;
  }

  get capacidadeMaxima(): number {
    return this.props.capacidadeMaxima;
  }

  get organizadorId(): string {
    return this.props.organizadorId;
  }

  get descricao(): string | undefined {
    return this.props.descricao;
  }

  get status(): 'ativo' | 'cancelado' | 'finalizado' {
    return this.props.status!;
  }

  get criadoEm(): Date {
    return this.props.criadoEm!;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm!;
  }

  atualizarEvento(dadosAtualizacao: Partial<EventoProps>): void {
    const novosDados = { ...this.props, ...dadosAtualizacao, atualizadoEm: new Date() };
    this.validarDados(novosDados);
    this.props = novosDados;
  }

  cancelarEvento(): void {
    this.props.status = 'cancelado';
    this.props.atualizadoEm = new Date();
  }

  finalizarEvento(): void {
    this.props.status = 'finalizado';
    this.props.atualizadoEm = new Date();
  }

  toJSON(): EventoProps {
    return { ...this.props };
  }
}
