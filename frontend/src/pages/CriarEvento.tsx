import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const CriarEvento: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState({
    nome: '',
    data: '',
    local: '',
    capacidadeMaxima: '',
    organizadorId: 'org_padrao_123', // Em um sistema real, viria da autenticação
    descricao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validações básicas
      if (!formData.nome || !formData.data || !formData.local || !formData.capacidadeMaxima) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      const dataEvento = new Date(formData.data);
      if (dataEvento <= new Date()) {
        throw new Error('A data do evento deve ser futura');
      }

      const capacidade = parseInt(formData.capacidadeMaxima);
      if (capacidade <= 0) {
        throw new Error('Capacidade deve ser maior que zero');
      }

      const eventData = {
        ...formData,
        capacidadeMaxima: capacidade
      };

      const response = await api.post('/eventos', eventData);

      if (response.data.sucesso) {
        setSuccess('Evento criado com sucesso!');
        setTimeout(() => {
          navigate('/eventos');
        }, 2000);
      } else {
        throw new Error(response.data.mensagem || 'Erro ao criar evento');
      }

    } catch (err: any) {
      setError(err.message || 'Erro desconhecido ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Criar Novo Evento</h1>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome">Nome do Evento *</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              placeholder="Digite o nome do evento"
            />
          </div>

          <div className="form-group">
            <label htmlFor="data">Data e Hora *</label>
            <input
              type="datetime-local"
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="local">Local *</label>
            <input
              type="text"
              id="local"
              name="local"
              value={formData.local}
              onChange={handleChange}
              required
              placeholder="Digite o local do evento"
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacidadeMaxima">Capacidade Máxima *</label>
            <input
              type="number"
              id="capacidadeMaxima"
              name="capacidadeMaxima"
              value={formData.capacidadeMaxima}
              onChange={handleChange}
              required
              min="1"
              placeholder="Número máximo de participantes"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              rows={4}
              placeholder="Descrição opcional do evento"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Criando...' : 'Criar Evento'}
            </button>
            
            <button 
              type="button" 
              className="btn"
              onClick={() => navigate('/eventos')}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
