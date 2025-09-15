export interface Evento {
  id: string;
  nome: string;
  data: string;
  local: string;
  capacidadeMaxima: number;
  organizadorId: string;
  descricao?: string;
  status: 'ativo' | 'cancelado' | 'finalizado';
  criadoEm: string;
  atualizadoEm: string;
}

export interface Ingresso {
  id: string;
  eventoId: string;
  tipo: 'vip' | 'pista' | 'camarote';
  preco: number;
  quantidadeDisponivel: number;
  descricao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Usuario {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  documento: string;
  curso?: string;
  numeroMatricula?: string;
  tipo: 'organizador' | 'participante';
  criadoEm: string;
  atualizadoEm: string;
}

export interface Compra {
  id: string;
  usuarioId: string;
  eventoId: string;
  ingressoId: string;
  quantidade: number;
  valorTotal: number;
  codigoQR: string;
  status: 'pendente' | 'confirmada' | 'cancelada' | 'utilizada';
  hashSeguranca: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ApiResponse<T> {
  sucesso: boolean;
  mensagem: string;
  dados?: T;
  erro?: string;
}
