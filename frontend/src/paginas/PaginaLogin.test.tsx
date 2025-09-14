import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PaginaLogin from '../src/paginas/PaginaLogin';
import { ProvedorAutenticacao } from '../src/contextos/ContextoAutenticacao';

// Mock do serviço de API
const mockLogin = vi.fn();
vi.mock('../src/servicos/api', () => ({
  apiService: {
    login: mockLogin
  }
}));

// Mock do react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock do react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ProvedorAutenticacao>
      {children}
    </ProvedorAutenticacao>
  </BrowserRouter>
);

describe('PaginaLogin', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('deve renderizar formulário de login', () => {
    render(
      <TestWrapper>
        <PaginaLogin />
      </TestWrapper>
    );

    expect(screen.getByText('Entrar no Sistema')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('Não tem uma conta?')).toBeInTheDocument();
  });

  test('deve validar campos obrigatórios', async () => {
    // Mock do window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <TestWrapper>
        <PaginaLogin />
      </TestWrapper>
    );

    const botaoEntrar = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(botaoEntrar);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Por favor, preencha todos os campos');
    });

    alertSpy.mockRestore();
  });

  test('deve preencher campos e submeter formulário', async () => {
    mockLogin.mockResolvedValue({
      usuario: {
        id: '1',
        nome: 'João Silva',
        email: 'joao@exemplo.com',
        tipoUsuario: 'organizador'
      },
      token: 'fake-token'
    });

    render(
      <TestWrapper>
        <PaginaLogin />
      </TestWrapper>
    );

    const inputEmail = screen.getByLabelText('Email:');
    const inputSenha = screen.getByLabelText('Senha:');
    const botaoEntrar = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(inputEmail, { target: { value: 'joao@exemplo.com' } });
    fireEvent.change(inputSenha, { target: { value: '123456' } });

    fireEvent.click(botaoEntrar);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('joao@exemplo.com', '123456');
    });
  });

  test('deve mostrar estado de carregamento durante login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TestWrapper>
        <PaginaLogin />
      </TestWrapper>
    );

    const inputEmail = screen.getByLabelText('Email:');
    const inputSenha = screen.getByLabelText('Senha:');
    const botaoEntrar = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(inputEmail, { target: { value: 'teste@exemplo.com' } });
    fireEvent.change(inputSenha, { target: { value: '123456' } });

    fireEvent.click(botaoEntrar);

    expect(screen.getByText('Entrando...')).toBeInTheDocument();
    expect(botaoEntrar).toBeDisabled();
  });

  test('deve tratar erro de login', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLogin.mockRejectedValue(new Error('Credenciais inválidas'));

    render(
      <TestWrapper>
        <PaginaLogin />
      </TestWrapper>
    );

    const inputEmail = screen.getByLabelText('Email:');
    const inputSenha = screen.getByLabelText('Senha:');
    const botaoEntrar = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(inputEmail, { target: { value: 'erro@exemplo.com' } });
    fireEvent.change(inputSenha, { target: { value: 'senhaerrada' } });

    fireEvent.click(botaoEntrar);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao fazer login:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
