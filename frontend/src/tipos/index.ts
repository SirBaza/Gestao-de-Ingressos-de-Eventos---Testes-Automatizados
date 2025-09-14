// Tipos compartilhados entre frontend e backend
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipoUsuario: 'organizador' | 'comprador';
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Evento {
  id: string;
  nome: string;
  descricao: string;
  data: Date;
  local: string;
  capacidadeMaxima: number;
  organizadorId: string;
  tiposIngresso: TipoIngresso[];
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface TipoIngresso {
  id: string;
  nome: string;
  preco: number;
  quantidadeDisponivel: number;
  quantidadeVendida: number;
  eventoId: string;
}

export interface Ingresso {
  id: string;
  codigoQr: string;
  eventoId: string;
  tipoIngressoId: string;
  compradorId: string;
  nomeComprador: string;
  emailComprador: string;
  telefoneComprador?: string;
  usado: boolean;
  dataCompra: Date;
  dataUso?: Date;
  hashSeguranca: string;
}

// Tipos específicos do frontend
export interface ContextoAutenticacao {
  usuario: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  registrar: (dadosUsuario: DadosRegistro) => Promise<void>;
  logout: () => void;
  carregando: boolean;
}

export interface DadosRegistro {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
  confirmarSenha: string;
  tipoUsuario: 'organizador' | 'comprador';
}

export interface FormularioEvento {
  nome: string;
  descricao: string;
  data: string;
  local: string;
  capacidadeMaxima: number;
  tiposIngresso: {
    nome: string;
    preco: number;
    quantidadeDisponivel: number;
  }[];
}

export interface FormularioCompra {
  tipoIngressoId: string;
  quantidade: number;
  comprador: {
    nome: string;
    email: string;
    telefone?: string;
  };
}

export interface IngressoComDetalhes extends Ingresso {
  evento?: {
    nome: string;
    data: Date;
    local: string;
  };
  tipoIngresso?: {
    nome: string;
    preco: number;
  };
}

export interface EstatisticasEvento {
  evento: {
    nome: string;
    data: Date;
    capacidadeMaxima: number;
  };
  estatisticas: {
    ingressosVendidos: number;
    ingressosUsados: number;
    ingressosDisponiveis: number;
    percentualOcupacao: number;
    percentualCheckIn: number;
  };
}

export interface RespostaValidacao {
  valido: boolean;
  ingresso?: Ingresso;
  evento?: Evento;
  mensagem: string;
}

export interface ErroApi {
  mensagem: string;
  codigo?: string;
  detalhes?: any;
}
