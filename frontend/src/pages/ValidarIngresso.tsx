import React, { useState } from 'react';
import api from '../services/api';

interface ValidacaoResult {
  valido: boolean;
  jaUtilizado: boolean;
  mensagem: string;
  dadosParticipante?: {
    nome: string;
    documento: string;
    nomeEvento: string;
    tipoIngresso: string;
  };
}

export const ValidarIngresso: React.FC = () => {
  const [codigoQR, setCodigoQR] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ValidacaoResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigoQR.trim()) {
      setResultado({
        valido: false,
        jaUtilizado: false,
        mensagem: 'Por favor, digite o código QR'
      });
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const response = await api.post('/validar-ingresso', {
        codigoQR: codigoQR.trim()
      });

      setResultado({
        valido: response.data.valido,
        jaUtilizado: response.data.jaUtilizado,
        mensagem: response.data.mensagem,
        dadosParticipante: response.data.dadosParticipante
      });

    } catch (err: any) {
      setResultado({
        valido: false,
        jaUtilizado: false,
        mensagem: err.response?.data?.mensagem || 'Erro ao validar ingresso'
      });
    } finally {
      setLoading(false);
    }
  };

  const limparResultado = () => {
    setResultado(null);
    setCodigoQR('');
  };

  const getStatusClass = () => {
    if (!resultado) return '';
    if (resultado.valido && !resultado.jaUtilizado) return 'alert-success';
    if (resultado.jaUtilizado) return 'alert-warning';
    return 'alert-error';
  };

  const getStatusIcon = () => {
    if (!resultado) return '';
    if (resultado.valido && !resultado.jaUtilizado) return '✅';
    if (resultado.jaUtilizado) return '⚠️';
    return '❌';
  };

  return (
    <div>
      <h1>Validação de Ingresso</h1>
      <p>Digite o código QR do ingresso para validar a entrada no evento.</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="codigoQR">Código QR do Ingresso</label>
            <input
              type="text"
              id="codigoQR"
              value={codigoQR}
              onChange={(e) => setCodigoQR(e.target.value)}
              placeholder="Digite ou cole o código QR aqui"
              disabled={loading}
              style={{ fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading || !codigoQR.trim()}
              style={{ flex: 1 }}
            >
              {loading ? 'Validando...' : 'Validar Ingresso'}
            </button>
            
            {resultado && (
              <button 
                type="button" 
                className="btn"
                onClick={limparResultado}
                style={{ flex: 1 }}
              >
                Nova Validação
              </button>
            )}
          </div>
        </form>
      </div>

      {resultado && (
        <div className={`card ${getStatusClass()}`} style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{getStatusIcon()}</span>
            <h3 style={{ margin: 0 }}>
              {resultado.valido && !resultado.jaUtilizado ? 'INGRESSO VÁLIDO' :
               resultado.jaUtilizado ? 'INGRESSO JÁ UTILIZADO' :
               'INGRESSO INVÁLIDO'}
            </h3>
          </div>

          <p><strong>Mensagem:</strong> {resultado.mensagem}</p>

          {resultado.dadosParticipante && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
              <h4>Dados do Participante:</h4>
              <p><strong>Nome:</strong> {resultado.dadosParticipante.nome}</p>
              <p><strong>Documento:</strong> {resultado.dadosParticipante.documento}</p>
              <p><strong>Evento:</strong> {resultado.dadosParticipante.nomeEvento}</p>
              <p><strong>Tipo de Ingresso:</strong> {resultado.dadosParticipante.tipoIngresso}</p>
            </div>
          )}

          {resultado.valido && !resultado.jaUtilizado && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#2ecc71', color: 'white', borderRadius: '4px', textAlign: 'center' }}>
              <h3 style={{ margin: 0 }}>✅ ENTRADA AUTORIZADA ✅</h3>
              <p style={{ margin: '0.5rem 0 0 0' }}>O participante pode entrar no evento</p>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem', backgroundColor: '#f8f9fa' }}>
        <h3>Como usar:</h3>
        <ol>
          <li>Cole ou digite o código QR do ingresso no campo acima</li>
          <li>Clique em "Validar Ingresso"</li>
          <li>Verifique o resultado da validação</li>
          <li>Se válido, autorize a entrada do participante</li>
        </ol>
        
        <p><strong>Observação:</strong> Cada ingresso só pode ser utilizado uma única vez.</p>
      </div>
    </div>
  );
};
