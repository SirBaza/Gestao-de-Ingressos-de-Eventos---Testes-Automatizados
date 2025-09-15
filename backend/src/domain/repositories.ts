import { Evento } from './entities/evento';
import { Ingresso } from './entities/ingresso';
import { Usuario } from './entities/usuario';
import { Compra } from './entities/compra';

export interface EventoRepository {
  salvar(evento: Evento): Promise<void>;
  buscarPorId(id: string): Promise<Evento | null>;
  listarTodos(): Promise<Evento[]>;
  listarPorOrganizador(organizadorId: string): Promise<Evento[]>;
  atualizar(evento: Evento): Promise<void>;
  deletar(id: string): Promise<void>;
}

export interface IngressoRepository {
  salvar(ingresso: Ingresso): Promise<void>;
  buscarPorId(id: string): Promise<Ingresso | null>;
  listarPorEvento(eventoId: string): Promise<Ingresso[]>;
  atualizar(ingresso: Ingresso): Promise<void>;
  deletar(id: string): Promise<void>;
}

export interface UsuarioRepository {
  salvar(usuario: Usuario): Promise<void>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorDocumento(documento: string): Promise<Usuario | null>;
  listarTodos(): Promise<Usuario[]>;
  atualizar(usuario: Usuario): Promise<void>;
  deletar(id: string): Promise<void>;
}

export interface CompraRepository {
  salvar(compra: Compra): Promise<void>;
  buscarPorId(id: string): Promise<Compra | null>;
  buscarPorCodigoQR(codigoQR: string): Promise<Compra | null>;
  listarPorUsuario(usuarioId: string): Promise<Compra[]>;
  listarPorEvento(eventoId: string): Promise<Compra[]>;
  atualizar(compra: Compra): Promise<void>;
  deletar(id: string): Promise<void>;
}
