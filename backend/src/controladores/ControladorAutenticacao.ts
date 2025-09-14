import { Request, Response } from 'express';
import { ModeloUsuario } from '../modelos/ModeloUsuario';
import { CriarUsuarioDto, LoginDto, RespostaLogin } from '../tipos';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-desenvolvimento';

export class ControladorAutenticacao {
  static async registrar(req: Request, res: Response): Promise<void> {
    try {
      const dadosUsuario: CriarUsuarioDto = req.body;

      // Validações básicas
      if (!dadosUsuario.nome || !dadosUsuario.email || !dadosUsuario.senha) {
        res.status(400).json({
          mensagem: 'Nome, email e senha são obrigatórios'
        });
        return;
      }

      if (dadosUsuario.senha.length < 6) {
        res.status(400).json({
          mensagem: 'Senha deve ter pelo menos 6 caracteres'
        });
        return;
      }

      const usuario = await ModeloUsuario.criarUsuario(dadosUsuario);
      
      // Não retornar a senha na resposta
      const { senha, ...usuarioSemSenha } = usuario;
      
      res.status(201).json({
        mensagem: 'Usuário criado com sucesso',
        usuario: usuarioSemSenha
      });
    } catch (error: any) {
      res.status(400).json({
        mensagem: error.message || 'Erro ao criar usuário'
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha }: LoginDto = req.body;

      if (!email || !senha) {
        res.status(400).json({
          mensagem: 'Email e senha são obrigatórios'
        });
        return;
      }

      const usuario = await ModeloUsuario.buscarPorEmail(email);
      if (!usuario) {
        res.status(401).json({
          mensagem: 'Credenciais inválidas'
        });
        return;
      }

      const senhaValida = await ModeloUsuario.verificarSenha(senha, usuario.senha);
      if (!senhaValida) {
        res.status(401).json({
          mensagem: 'Credenciais inválidas'
        });
        return;
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipoUsuario: usuario.tipoUsuario 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { senha: _, ...usuarioSemSenha } = usuario;
      
      const resposta: RespostaLogin = {
        usuario: usuarioSemSenha,
        token
      };

      res.json(resposta);
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro interno do servidor'
      });
    }
  }

  static async perfil(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.id;
      
      if (!usuarioId) {
        res.status(401).json({
          mensagem: 'Token inválido'
        });
        return;
      }

      const usuario = await ModeloUsuario.buscarPorId(usuarioId);
      if (!usuario) {
        res.status(404).json({
          mensagem: 'Usuário não encontrado'
        });
        return;
      }

      const { senha, ...usuarioSemSenha } = usuario;
      res.json(usuarioSemSenha);
    } catch (error: any) {
      res.status(500).json({
        mensagem: error.message || 'Erro interno do servidor'
      });
    }
  }
}
