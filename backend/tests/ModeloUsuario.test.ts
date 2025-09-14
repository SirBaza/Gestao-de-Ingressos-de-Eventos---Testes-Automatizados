import { describe, test, expect, beforeEach } from 'vitest';
import { ModeloUsuario } from '../src/modelos/ModeloUsuario';
import { CriarUsuarioDto } from '../src/tipos';

describe('ModeloUsuario', () => {
  beforeEach(() => {
    // Limpar dados antes de cada teste
    ModeloUsuario.limparDados();
  });

  describe('criarUsuario', () => {
    test('deve criar um usuário válido', async () => {
      const dadosUsuario: CriarUsuarioDto = {
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        senha: '123456',
        tipoUsuario: 'organizador'
      };

      const usuario = await ModeloUsuario.criarUsuario(dadosUsuario);

      expect(usuario.id).toBeDefined();
      expect(usuario.nome).toBe(dadosUsuario.nome);
      expect(usuario.email).toBe(dadosUsuario.email);
      expect(usuario.tipoUsuario).toBe(dadosUsuario.tipoUsuario);
      expect(usuario.senha).not.toBe(dadosUsuario.senha); // Senha deve estar criptografada
      expect(usuario.criadoEm).toBeInstanceOf(Date);
      expect(usuario.atualizadoEm).toBeInstanceOf(Date);
    });

    test('deve rejeitar usuário com email duplicado', async () => {
      const dadosUsuario: CriarUsuarioDto = {
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        senha: '123456',
        tipoUsuario: 'organizador'
      };

      await ModeloUsuario.criarUsuario(dadosUsuario);

      await expect(ModeloUsuario.criarUsuario(dadosUsuario))
        .rejects
        .toThrow('Usuário já existe com este email');
    });
  });

  describe('buscarPorEmail', () => {
    test('deve encontrar usuário por email', async () => {
      const dadosUsuario: CriarUsuarioDto = {
        nome: 'Maria Santos',
        email: 'maria@exemplo.com',
        senha: '123456',
        tipoUsuario: 'comprador'
      };

      await ModeloUsuario.criarUsuario(dadosUsuario);
      const usuario = await ModeloUsuario.buscarPorEmail('maria@exemplo.com');

      expect(usuario).toBeTruthy();
      expect(usuario?.email).toBe('maria@exemplo.com');
      expect(usuario?.nome).toBe('Maria Santos');
    });

    test('deve retornar null para email inexistente', async () => {
      const usuario = await ModeloUsuario.buscarPorEmail('inexistente@exemplo.com');
      expect(usuario).toBeNull();
    });
  });

  describe('verificarSenha', () => {
    test('deve verificar senha correta', async () => {
      const dadosUsuario: CriarUsuarioDto = {
        nome: 'Pedro Costa',
        email: 'pedro@exemplo.com',
        senha: 'minhasenha123',
        tipoUsuario: 'organizador'
      };

      const usuario = await ModeloUsuario.criarUsuario(dadosUsuario);
      const senhaValida = await ModeloUsuario.verificarSenha('minhasenha123', usuario.senha);

      expect(senhaValida).toBe(true);
    });

    test('deve rejeitar senha incorreta', async () => {
      const dadosUsuario: CriarUsuarioDto = {
        nome: 'Ana Silva',
        email: 'ana@exemplo.com',
        senha: 'senhaoriginal',
        tipoUsuario: 'comprador'
      };

      const usuario = await ModeloUsuario.criarUsuario(dadosUsuario);
      const senhaValida = await ModeloUsuario.verificarSenha('senhaerrada', usuario.senha);

      expect(senhaValida).toBe(false);
    });
  });

  describe('buscarPorId', () => {
    test('deve encontrar usuário por ID', async () => {
      const dadosUsuario: CriarUsuarioDto = {
        nome: 'Carlos Oliveira',
        email: 'carlos@exemplo.com',
        senha: '123456',
        tipoUsuario: 'organizador'
      };

      const usuarioCriado = await ModeloUsuario.criarUsuario(dadosUsuario);
      const usuario = await ModeloUsuario.buscarPorId(usuarioCriado.id);

      expect(usuario).toBeTruthy();
      expect(usuario?.id).toBe(usuarioCriado.id);
      expect(usuario?.nome).toBe('Carlos Oliveira');
    });

    test('deve retornar null para ID inexistente', async () => {
      const usuario = await ModeloUsuario.buscarPorId('id-inexistente');
      expect(usuario).toBeNull();
    });
  });

  describe('listarTodos', () => {
    test('deve listar todos os usuários sem as senhas', async () => {
      const usuarios = [
        {
          nome: 'Usuário 1',
          email: 'usuario1@exemplo.com',
          senha: '123456',
          tipoUsuario: 'organizador' as const
        },
        {
          nome: 'Usuário 2',
          email: 'usuario2@exemplo.com',
          senha: '123456',
          tipoUsuario: 'comprador' as const
        }
      ];

      for (const dadosUsuario of usuarios) {
        await ModeloUsuario.criarUsuario(dadosUsuario);
      }

      const listaUsuarios = await ModeloUsuario.listarTodos();

      expect(listaUsuarios).toHaveLength(2);
      expect(listaUsuarios[0]).not.toHaveProperty('senha');
      expect(listaUsuarios[1]).not.toHaveProperty('senha');
      expect(listaUsuarios[0].nome).toBe('Usuário 1');
      expect(listaUsuarios[1].nome).toBe('Usuário 2');
    });

    test('deve retornar lista vazia quando não há usuários', async () => {
      const listaUsuarios = await ModeloUsuario.listarTodos();
      expect(listaUsuarios).toHaveLength(0);
    });
  });
});
