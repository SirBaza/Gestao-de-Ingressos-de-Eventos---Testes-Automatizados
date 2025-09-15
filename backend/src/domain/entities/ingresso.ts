export type TipoIngresso = 'vip' | 'pista' | 'camarote';

export interface IngressoProps {
  id?: string;
  eventoId: string;
  tipo: TipoIngresso;
  preco: number;
  quantidadeDisponivel: number;
  descricao?: string;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Ingresso {
  private props: IngressoProps;

  constructor(props: IngressoProps) {
    this.validarDados(props);
    this.props = {
      ...props,
      id: props.id || this.gerarId(),
      criadoEm: props.criadoEm || new Date(),
      atualizadoEm: props.atualizadoEm || new Date()
    };
  }

  private validarDados(props: IngressoProps): void {
    if (!props.eventoId) {
      throw new Error('ID do evento é obrigatório');
    }

    if (!['vip', 'pista', 'camarote'].includes(props.tipo)) {
      throw new Error('Tipo de ingresso inválido');
    }

    if (!props.preco || props.preco < 0) {
      throw new Error('Preço deve ser maior ou igual a zero');
    }

    if (!props.quantidadeDisponivel || props.quantidadeDisponivel < 0) {
      throw new Error('Quantidade disponível deve ser maior ou igual a zero');
    }
  }

  private gerarId(): string {
    return 'ingresso_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  get id(): string {
    return this.props.id!;
  }

  get eventoId(): string {
    return this.props.eventoId;
  }

  get tipo(): TipoIngresso {
    return this.props.tipo;
  }

  get preco(): number {
    return this.props.preco;
  }

  get quantidadeDisponivel(): number {
    return this.props.quantidadeDisponivel;
  }

  get descricao(): string | undefined {
    return this.props.descricao;
  }

  get criadoEm(): Date {
    return this.props.criadoEm!;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm!;
  }

  atualizarQuantidade(novaQuantidade: number): void {
    if (novaQuantidade < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }
    this.props.quantidadeDisponivel = novaQuantidade;
    this.props.atualizadoEm = new Date();
  }

  reduzirQuantidade(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade a reduzir deve ser positiva');
    }
    if (this.props.quantidadeDisponivel < quantidade) {
      throw new Error('Quantidade insuficiente disponível');
    }
    this.props.quantidadeDisponivel -= quantidade;
    this.props.atualizadoEm = new Date();
  }

  aumentarQuantidade(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade a aumentar deve ser positiva');
    }
    this.props.quantidadeDisponivel += quantidade;
    this.props.atualizadoEm = new Date();
  }

  toJSON(): IngressoProps {
    return { ...this.props };
  }
}
