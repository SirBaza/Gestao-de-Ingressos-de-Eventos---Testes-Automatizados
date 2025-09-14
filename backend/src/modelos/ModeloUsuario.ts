import { Usuario, CriarUsuarioDto } from '../tipos';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Simulação de banco de dados em memória
let usuarios: Usuario[] = [];

export class ModeloUsuario {
  static async criarUsuario(dadosUsuario: CriarUsuarioDto): Promise<Usuario> {
    // Verificar se já existe usuário com o mesmo email
    const usuarioExistente = usuarios.find(u => u.email === dadosUsuario.email);
    if (usuarioExistente) {
      throw new Error('Usuário já existe com este email');
    }

    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(dadosUsuario.senha, 10);

    const novoUsuario: Usuario = {
      id: uuidv4(),
      nome: dadosUsuario.nome,
      email: dadosUsuario.email,
      telefone: dadosUsuario.telefone,
      senha: senhaCriptografada,
      tipoUsuario: dadosUsuario.tipoUsuario,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    usuarios.push(novoUsuario);
    return novoUsuario;
  }

  static async buscarPorEmail(email: string): Promise<Usuario | null> {
    return usuarios.find(u => u.email === email) || null;
  }

  static async buscarPorId(id: string): Promise<Usuario | null> {
    return usuarios.find(u => u.id === id) || null;
  }

  static async verificarSenha(senha: string, senhaHash: string): Promise<boolean> {
    return bcrypt.compare(senha, senhaHash);
  }

  static async listarTodos(): Promise<Omit<Usuario, 'senha'>[]> {
    return usuarios.map(({ senha, ...usuario }) => usuario);
  }

  static async atualizar(id: string, dadosAtualizacao: Partial<CriarUsuarioDto>): Promise<Usuario | null> {
    const indiceUsuario = usuarios.findIndex(u => u.id === id);
    if (indiceUsuario === -1) return null;

    const usuario = usuarios[indiceUsuario];
    const usuarioAtualizado: Usuario = {
      ...usuario,
      ...dadosAtualizacao,
      atualizadoEm: new Date()
    };

    if (dadosAtualizacao.senha) {
      usuarioAtualizado.senha = await bcrypt.hash(dadosAtualizacao.senha, 10);
    }

    usuarios[indiceUsuario] = usuarioAtualizado;
    return usuarioAtualizado;
  }

  static async remover(id: string): Promise<boolean> {
    const indiceUsuario = usuarios.findIndex(u => u.id === id);
    if (indiceUsuario === -1) return false;

    usuarios.splice(indiceUsuario, 1);
    return true;
  }

  // Método para limpar dados (útil para testes)
  static limparDados(): void {
    usuarios = [];
  }
}
