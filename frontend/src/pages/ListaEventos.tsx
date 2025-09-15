import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Evento } from '../types';

export const ListaEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/eventos');
      setEventos(response.data.eventos || []);
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataStr: string) => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Carregando eventos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button onClick={carregarEventos} className="btn" style={{ marginLeft: '1rem' }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Eventos Disponíveis</h1>
        <Link to="/criar-evento" className="btn btn-success">
          Criar Novo Evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div className="card">
          <h3>Nenhum evento encontrado</h3>
          <p>Não há eventos disponíveis no momento.</p>
          <Link to="/criar-evento" className="btn">
            Criar Primeiro Evento
          </Link>
        </div>
      ) : (
        <div className="grid">
          {eventos.map((evento) => (
            <div key={evento.id} className="card evento-card">
              <h3>{evento.nome}</h3>
              <p><strong>Data:</strong> {formatarData(evento.data)}</p>
              <p><strong>Local:</strong> {evento.local}</p>
              <p><strong>Capacidade:</strong> {evento.capacidadeMaxima} pessoas</p>
              {evento.descricao && (
                <p><strong>Descrição:</strong> {evento.descricao}</p>
              )}
              <p>
                <span className={`badge ${evento.status === 'ativo' ? 'badge-success' : 
                  evento.status === 'cancelado' ? 'badge-danger' : 'badge-warning'}`}>
                  {evento.status.toUpperCase()}
                </span>
              </p>
              
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Link 
                  to={`/comprar/${evento.id}`} 
                  className="btn"
                  style={{ flex: 1 }}
                >
                  Comprar Ingresso
                </Link>
                <button 
                  onClick={() => alert('Funcionalidade em desenvolvimento')}
                  className="btn btn-warning"
                  style={{ flex: 1 }}
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
