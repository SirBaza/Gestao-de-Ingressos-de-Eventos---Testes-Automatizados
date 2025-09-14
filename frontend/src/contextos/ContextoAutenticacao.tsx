import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, ContextoAutenticacao, DadosRegistro } from '../tipos';
import { apiService } from '../servicos/api';
import toast from 'react-hot-toast';

const ContextoAuth = createContext<ContextoAutenticacao | undefined>(undefined);

interface ProvedorAutenticacaoProps {
  children: ReactNode;
}

export const ProvedorAutenticacao: React.FC<ProvedorAutenticacaoProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Verificar se há token e usuário salvos no localStorage
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (tokenSalvo && usuarioSalvo) {
      try {
        const usuarioParsed = JSON.parse(usuarioSalvo);
        setToken(tokenSalvo);
        setUsuario(usuarioParsed);
      } catch (error) {
        console.error('Erro ao recuperar dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }

    setCarregando(false);
  }, []);

  const login = async (email: string, senha: string): Promise<void> => {
    try {
      setCarregando(true);
      const resposta = await apiService.login(email, senha);
      
      setUsuario(resposta.usuario);
      setToken(resposta.token);
      
      // Salvar no localStorage
      localStorage.setItem('token', resposta.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      const mensagem = error.response?.data?.mensagem || 'Erro ao fazer login';
      toast.error(mensagem);
      throw new Error(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const registrar = async (dadosUsuario: DadosRegistro): Promise<void> => {
    try {
      setCarregando(true);
      
      // Validações básicas
      if (dadosUsuario.senha !== dadosUsuario.confirmarSenha) {
        throw new Error('As senhas não coincidem');
      }

      const { confirmarSenha, ...dadosParaEnvio } = dadosUsuario;
      
      await apiService.registrar(dadosParaEnvio);
      toast.success('Usuário registrado com sucesso! Faça login para continuar.');
    } catch (error: any) {
      const mensagem = error.response?.data?.mensagem || error.message || 'Erro ao registrar usuário';
      toast.error(mensagem);
      throw new Error(mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const logout = (): void => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    toast.success('Logout realizado com sucesso!');
  };

  const valorContexto: ContextoAutenticacao = {
    usuario,
    token,
    login,
    registrar,
    logout,
    carregando
  };

  return (
    <ContextoAuth.Provider value={valorContexto}>
      {children}
    </ContextoAuth.Provider>
  );
};

export const useAuth = (): ContextoAutenticacao => {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um ProvedorAutenticacao');
  }
  return contexto;
};
