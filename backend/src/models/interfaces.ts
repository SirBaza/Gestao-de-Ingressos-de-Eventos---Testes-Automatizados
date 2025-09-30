export interface Evento {
  id?: number;
  nome: string;
  data: Date;
  capacidadeTotal: number;
  local: string;
  criadoEm?: Date;
}

export interface TipoIngresso {
  id?: number;
  eventoId: number;
  nome: string;
  preco: number;
  quantidadeDisponivel: number;
  quantidadeInicial: number;
  criadoEm?: Date;
}

export interface Compra {
  id?: number;
  eventoId: number;
  tipoIngressoId: number;
  nome: string;
  email: string;
  matricula: string;
  quantidade: number;
  valorTotal: number;
  criadoEm?: Date;
}

export interface Ingresso {
  id?: number;
  compraId: number;
  hash: string;
  usado: boolean;
  dataUso?: Date;
  criadoEm?: Date;
}
