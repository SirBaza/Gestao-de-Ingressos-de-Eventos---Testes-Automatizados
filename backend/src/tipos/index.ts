// Tipos básicos do sistema

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
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
  nome: string; // VIP, Pista, etc.
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

export interface Compra {
  id: string;
  compradorId: string;
  eventoId: string;
  ingressos: string[]; // IDs dos ingressos
  valorTotal: number;
  dataCompra: Date;
  status: 'pendente' | 'confirmada' | 'cancelada';
}

// DTOs para requests e responses

export interface CriarEventoDto {
  nome: string;
  descricao: string;
  data: string; // ISO string
  local: string;
  capacidadeMaxima: number;
  tiposIngresso: {
    nome: string;
    preco: number;
    quantidadeDisponivel: number;
  }[];
}

export interface ComprarIngressoDto {
  eventoId: string;
  tipoIngressoId: string;
  quantidade: number;
  comprador: {
    nome: string;
    email: string;
    telefone?: string;
  };
}

export interface ValidarIngressoDto {
  codigoQr: string;
}

export interface LoginDto {
  email: string;
  senha: string;
}

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
  tipoUsuario: 'organizador' | 'comprador';
}

// Response types
export interface RespostaLogin {
  usuario: Omit<Usuario, 'senha'>;
  token: string;
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
