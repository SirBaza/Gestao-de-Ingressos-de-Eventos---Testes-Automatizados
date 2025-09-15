import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>Gestão de Ingressos de Eventos</h1>
        </div>
      </header>

      <nav className="nav">
        <div className="container">
          <ul>
            <li>
              <Link to="/eventos">Eventos</Link>
            </li>
            <li>
              <Link to="/criar-evento">Criar Evento</Link>
            </li>
            <li>
              <Link to="/validar">Validar Ingresso</Link>
            </li>
          </ul>
        </div>
      </nav>

      <main className="container">
        {children}
      </main>

      <footer style={{ 
        marginTop: '4rem', 
        textAlign: 'center', 
        padding: '2rem',
        backgroundColor: '#2c3e50',
        color: 'white'
      }}>
        <p>&copy; 2025 Sistema de Gestão de Ingressos. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
