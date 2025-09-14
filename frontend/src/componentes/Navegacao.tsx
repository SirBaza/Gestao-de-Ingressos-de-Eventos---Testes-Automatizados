import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextos/ContextoAutenticacao';

export const Navegacao: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navegacao">
      <div className="navegacao-container">
        <Link to="/" className="logo">
          🎫 Sistema de Ingressos
        </Link>

        <div className="navegacao-links">
          <Link to="/eventos">Eventos</Link>
          
          {!usuario ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/registro">Registrar</Link>
            </>
          ) : (
            <>
              {usuario.tipoUsuario === 'organizador' && (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/criar-evento">Criar Evento</Link>
                </>
              )}
              
              {usuario.tipoUsuario === 'comprador' && (
                <Link to="/meus-ingressos">Meus Ingressos</Link>
              )}

              <Link to="/validar-ingresso">Validar Ingresso</Link>
              
              <div className="usuario-info">
                <span>Olá, {usuario.nome}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
