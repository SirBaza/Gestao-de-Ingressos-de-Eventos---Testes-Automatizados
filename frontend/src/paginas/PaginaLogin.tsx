import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contextos/ContextoAutenticacao';

const PaginaLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !senha) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      setCarregando(true);
      await login(email, senha);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="pagina-login">
      <div className="login-container">
        <h2>Entrar no Sistema</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="campo">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha:</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={carregando}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-links">
          <p>
            Não tem uma conta? 
            <Link to="/registro"> Registre-se aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;
