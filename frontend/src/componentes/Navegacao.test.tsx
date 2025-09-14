import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProvedorAutenticacao } from '../src/contextos/ContextoAutenticacao';
import { Navegacao } from '../src/componentes/Navegacao';

// Mock do serviço de API
vi.mock('../src/servicos/api', () => ({
  apiService: {
    login: vi.fn(),
    registrar: vi.fn(),
    perfil: vi.fn()
  }
}));

// Mock do react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Componente wrapper para testes
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ProvedorAutenticacao>
      {children}
    </ProvedorAutenticacao>
  </BrowserRouter>
);

describe('Navegacao', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('deve renderizar links públicos quando usuário não está logado', () => {
    render(
      <TestWrapper>
        <Navegacao />
      </TestWrapper>
    );

    expect(screen.getByText('🎫 Sistema de Ingressos')).toBeInTheDocument();
    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Registrar')).toBeInTheDocument();
  });

  test('deve renderizar links do organizador quando usuário é organizador', () => {
    // Simular usuário organizador logado
    const usuarioOrganizador = {
      id: '1',
      nome: 'João Organizador',
      email: 'joao@exemplo.com',
      tipoUsuario: 'organizador' as const,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify(usuarioOrganizador));

    render(
      <TestWrapper>
        <Navegacao />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Criar Evento')).toBeInTheDocument();
    expect(screen.getByText('Validar Ingresso')).toBeInTheDocument();
    expect(screen.getByText('Olá, João Organizador')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  test('deve renderizar links do comprador quando usuário é comprador', () => {
    // Simular usuário comprador logado
    const usuarioComprador = {
      id: '2',
      nome: 'Maria Compradora',
      email: 'maria@exemplo.com',
      tipoUsuario: 'comprador' as const,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify(usuarioComprador));

    render(
      <TestWrapper>
        <Navegacao />
      </TestWrapper>
    );

    expect(screen.getByText('Meus Ingressos')).toBeInTheDocument();
    expect(screen.getByText('Validar Ingresso')).toBeInTheDocument();
    expect(screen.getByText('Olá, Maria Compradora')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
    
    // Links do organizador não devem aparecer
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Criar Evento')).not.toBeInTheDocument();
  });

  test('deve fazer logout quando botão Sair é clicado', async () => {
    const usuarioLogado = {
      id: '1',
      nome: 'Usuário Teste',
      email: 'teste@exemplo.com',
      tipoUsuario: 'organizador' as const,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify(usuarioLogado));

    render(
      <TestWrapper>
        <Navegacao />
      </TestWrapper>
    );

    const botaoSair = screen.getByText('Sair');
    fireEvent.click(botaoSair);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('usuario')).toBeNull();
    });
  });
});
