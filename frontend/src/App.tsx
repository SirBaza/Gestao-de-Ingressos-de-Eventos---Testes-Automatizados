import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ListaEventos } from './pages/ListaEventos';
import { CriarEvento } from './pages/CriarEvento';
import { ComprarIngresso } from './pages/ComprarIngresso';
import { ValidarIngresso } from './pages/ValidarIngresso';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ListaEventos />} />
        <Route path="/eventos" element={<ListaEventos />} />
        <Route path="/criar-evento" element={<CriarEvento />} />
        <Route path="/comprar/:eventoId" element={<ComprarIngresso />} />
        <Route path="/validar" element={<ValidarIngresso />} />
      </Routes>
    </Layout>
  );
}

export default App;
