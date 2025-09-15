export interface UsuarioProps {
  id?: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  documento: string; // CPF ou RG
  curso?: string;
  numeroMatricula?: string;
  tipo: 'organizador' | 'participante';
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Usuario {
  private props: UsuarioProps;

  constructor(props: UsuarioProps) {
    this.validarDados(props);
    this.props = {
      ...props,
      id: props.id || this.gerarId(),
      criadoEm: props.criadoEm || new Date(),
      atualizadoEm: props.atualizadoEm || new Date()
    };
  }

  private validarDados(props: UsuarioProps): void {
    if (!props.nomeCompleto || props.nomeCompleto.trim().length < 3) {
      throw new Error('Nome completo deve ter pelo menos 3 caracteres');
    }

    if (!props.email || !this.validarEmail(props.email)) {
      throw new Error('Email inválido');
    }

    if (!props.telefone || props.telefone.trim().length < 10) {
      throw new Error('Telefone deve ter pelo menos 10 caracteres');
    }

    if (!props.documento || props.documento.trim().length < 8) {
      throw new Error('Documento deve ter pelo menos 8 caracteres');
    }

    if (!['organizador', 'participante'].includes(props.tipo)) {
      throw new Error('Tipo de usuário inválido');
    }
  }

  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private gerarId(): string {
    return 'usuario_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  get id(): string {
    return this.props.id!;
  }

  get nomeCompleto(): string {
    return this.props.nomeCompleto;
  }

  get email(): string {
    return this.props.email;
  }

  get telefone(): string {
    return this.props.telefone;
  }

  get documento(): string {
    return this.props.documento;
  }

  get curso(): string | undefined {
    return this.props.curso;
  }

  get numeroMatricula(): string | undefined {
    return this.props.numeroMatricula;
  }

  get tipo(): 'organizador' | 'participante' {
    return this.props.tipo;
  }

  get criadoEm(): Date {
    return this.props.criadoEm!;
  }

  get atualizadoEm(): Date {
    return this.props.atualizadoEm!;
  }

  atualizarDados(dadosAtualizacao: Partial<UsuarioProps>): void {
    const novosDados = { ...this.props, ...dadosAtualizacao, atualizadoEm: new Date() };
    this.validarDados(novosDados);
    this.props = novosDados;
  }

  isOrganizador(): boolean {
    return this.props.tipo === 'organizador';
  }

  isParticipante(): boolean {
    return this.props.tipo === 'participante';
  }

  toJSON(): UsuarioProps {
    return { ...this.props };
  }
}
