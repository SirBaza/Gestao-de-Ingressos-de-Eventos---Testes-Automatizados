import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao';
import { ComponenteRota } from './componentes/ComponenteRota';
import { Navegacao } from './componentes/Navegacao';

// Páginas
import PaginaInicial from './paginas/PaginaInicial';
import PaginaLogin from './paginas/PaginaLogin';
import PaginaRegistro from './paginas/PaginaRegistro';
import PaginaEventos from './paginas/PaginaEventos';
import PaginaCriarEvento from './paginas/PaginaCriarEvento';
import PaginaDetalhesEvento from './paginas/PaginaDetalhesEvento';
import PaginaComprarIngresso from './paginas/PaginaComprarIngresso';
import PaginaMeusIngressos from './paginas/PaginaMeusIngressos';
import PaginaValidarIngresso from './paginas/PaginaValidarIngresso';
import PaginaDashboard from './paginas/PaginaDashboard';

import './App.css';

function App() {
  return (
    <ProvedorAutenticacao>
      <Router>
        <div className="App">
          <Navegacao />
          <main className="conteudo-principal">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<PaginaInicial />} />
              <Route path="/login" element={<PaginaLogin />} />
              <Route path="/registro" element={<PaginaRegistro />} />
              <Route path="/eventos" element={<PaginaEventos />} />
              <Route path="/eventos/:id" element={<PaginaDetalhesEvento />} />
              <Route path="/eventos/:id/comprar" element={<PaginaComprarIngresso />} />
              <Route path="/meus-ingressos" element={<PaginaMeusIngressos />} />
              <Route path="/validar-ingresso" element={<PaginaValidarIngresso />} />

              {/* Rotas protegidas para organizadores */}
              <Route 
                path="/dashboard" 
                element={
                  <ComponenteRota tipoUsuarioRequerido="organizador">
                    <PaginaDashboard />
                  </ComponenteRota>
                } 
              />
              <Route 
                path="/criar-evento" 
                element={
                  <ComponenteRota tipoUsuarioRequerido="organizador">
                    <PaginaCriarEvento />
                  </ComponenteRota>
                } 
              />

              {/* Rota 404 */}
              <Route path="*" element={<div>Página não encontrada</div>} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </ProvedorAutenticacao>
  );
}

export default App;