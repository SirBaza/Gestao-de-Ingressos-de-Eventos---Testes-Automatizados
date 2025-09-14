import React from 'react';
import { Link } from 'react-router-dom';

const PaginaInicial: React.FC = () => {
  return (
    <div className="pagina-inicial">
      <div className="hero">
        <h1>Sistema de Gestão de Ingressos</h1>
        <p>Crie eventos, venda ingressos e valide entradas com código QR</p>
        
        <div className="hero-buttons">
          <Link to="/eventos" className="btn btn-primary">
            Ver Eventos
          </Link>
          <Link to="/registro" className="btn btn-secondary">
            Começar Agora
          </Link>
        </div>
      </div>

      <div className="recursos">
        <div className="container">
          <h2>Principais Recursos</h2>
          
          <div className="recursos-grid">
            <div className="recurso">
              <h3>🎫 Gestão de Eventos</h3>
              <p>Crie e gerencie seus eventos de forma simples e eficiente</p>
            </div>
            
            <div className="recurso">
              <h3>💳 Venda de Ingressos</h3>
              <p>Sistema completo para venda online de ingressos</p>
            </div>
            
            <div className="recurso">
              <h3>📱 Validação com QR Code</h3>
              <p>Valide ingressos rapidamente usando a câmera do dispositivo</p>
            </div>
            
            <div className="recurso">
              <h3>📊 Relatórios e Estatísticas</h3>
              <p>Acompanhe as vendas e estatísticas dos seus eventos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaInicial;
