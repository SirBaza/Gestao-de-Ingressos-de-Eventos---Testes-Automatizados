import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ComprarIngresso: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [codigoQR, setCodigoQR] = useState<string>('');

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    documento: '',
    curso: '',
    numeroMatricula: '',
    tipoIngresso: 'pista',
    quantidade: '1'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      if (!formData.nomeCompleto || !formData.email || !formData.telefone || !formData.documento) {
        throw new Error('Todos os campos obrigatórios devem ser preenchidos');
      }

      // Simular criação de usuário e compra
      // Em um sistema real, isso seria feito com autenticação adequada
      const usuarioId = 'usuario_' + Date.now();
      const ingressoId = 'ingresso_' + formData.tipoIngresso + '_' + eventoId;
      
      const compraData = {
        usuarioId,
        eventoId,
        ingressoId,
        quantidade: parseInt(formData.quantidade)
      };

      const response = await api.post('/compras', compraData);

      if (response.data.sucesso) {
        setCodigoQR(response.data.compra.codigoQR);
        setSuccess('Compra realizada com sucesso! Seu ingresso foi gerado.');
      } else {
        throw new Error(response.data.mensagem || 'Erro ao processar compra');
      }

    } catch (err: any) {
      setError(err.response?.data?.mensagem || err.message || 'Erro desconhecido ao processar compra');
    } finally {
      setLoading(false);
    }
  };

  if (success && codigoQR) {
    return (
      <div>
        <h1>Compra Realizada com Sucesso!</h1>
        
        <div className="alert alert-success">
          {success}
        </div>

        <div className="card ingresso-card">
          <h3>Seu Ingresso Digital</h3>
          <p><strong>Código QR:</strong></p>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px', 
            fontFamily: 'monospace',
            wordBreak: 'break-all',
            marginBottom: '1rem'
          }}>
            {codigoQR}
          </div>
          
          <div style={{ background: '#fff', padding: '2rem', textAlign: 'center', border: '2px dashed #ccc' }}>
            <p>Aqui seria exibido o QR Code visual</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              (Use o código acima para validação no evento)
            </p>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button onClick={() => navigate('/eventos')} className="btn">
              Voltar aos Eventos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Comprar Ingresso</h1>
      <p>Evento ID: {eventoId}</p>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <h3>Dados do Participante</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nomeCompleto">Nome Completo *</label>
            <input
              type="text"
              id="nomeCompleto"
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              required
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Digite seu e-mail"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone *</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              placeholder="Digite seu telefone"
            />
          </div>

          <div className="form-group">
            <label htmlFor="documento">Documento (CPF/RG) *</label>
            <input
              type="text"
              id="documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              required
              placeholder="Digite seu CPF ou RG"
            />
          </div>

          <div className="form-group">
            <label htmlFor="curso">Curso (opcional)</label>
            <input
              type="text"
              id="curso"
              name="curso"
              value={formData.curso}
              onChange={handleChange}
              placeholder="Digite seu curso"
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroMatricula">Número de Matrícula (opcional)</label>
            <input
              type="text"
              id="numeroMatricula"
              name="numeroMatricula"
              value={formData.numeroMatricula}
              onChange={handleChange}
              placeholder="Digite seu número de matrícula"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoIngresso">Tipo de Ingresso</label>
            <select
              id="tipoIngresso"
              name="tipoIngresso"
              value={formData.tipoIngresso}
              onChange={handleChange}
            >
              <option value="pista">Pista - R$ 50,00</option>
              <option value="vip">VIP - R$ 100,00</option>
              <option value="camarote">Camarote - R$ 150,00</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantidade">Quantidade</label>
            <select
              id="quantidade"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
            >
              <option value="1">1 ingresso</option>
              <option value="2">2 ingressos</option>
              <option value="3">3 ingressos</option>
              <option value="4">4 ingressos</option>
              <option value="5">5 ingressos</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Processando...' : 'Comprar Ingresso'}
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
