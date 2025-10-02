import React, { useState } from "react";
import Scanner from "./Scanner";
import { apiService, ValidacaoResponse } from "../services/api";

interface ValidacaoEstado {
  carregando: boolean;
  resultado: ValidacaoResponse | null;
}

const ScannerIntegrado: React.FC = () => {
  const [estado, setEstado] = useState<ValidacaoEstado>({
    carregando: false,
    resultado: null,
  });

  const handleScan = async (hash: string) => {
    setEstado({
      carregando: true,
      resultado: null,
    });

    try {
      const resultado = await apiService.validarIngresso({ hash });
      setEstado({
        carregando: false,
        resultado,
      });
    } catch (error) {
      setEstado({
        carregando: false,
        resultado: {
          valido: false,
          error: error instanceof Error ? error.message : "Erro na validação",
        },
      });
    }
  };

  const handleError = (error: string) => {
    setEstado({
      carregando: false,
      resultado: {
        valido: false,
        error: error,
      },
    });
  };

  const handleLimpar = () => {
    setEstado({
      carregando: false,
      resultado: null,
    });
  };

  return (
    <div className='scanner-integrado' data-testid='scanner-integrado'>
      <h1>Validação de Ingressos</h1>

      <Scanner
        onScan={handleScan}
        onError={handleError}
        disabled={estado.carregando}
      />

      {estado.carregando && (
        <div
          className='carregando-validacao'
          data-testid='carregando-validacao'
        >
          <p>🔍 Validando ingresso...</p>
        </div>
      )}

      {estado.resultado && (
        <div className='resultado-validacao' data-testid='resultado-validacao'>
          {estado.resultado.valido ? (
            <div className='ingresso-valido' data-testid='ingresso-valido'>
              <div className='status-header'>
                <h2>✅ Ingresso Válido!</h2>
                <p className='status-message'>
                  Ingresso autorizado para entrada
                </p>
              </div>

              <div className='dados-comprador' data-testid='dados-comprador'>
                <h3>👤 Dados do Comprador</h3>
                <p>
                  <strong>Nome:</strong> {estado.resultado.comprador?.nome}
                </p>
                <p>
                  <strong>Email:</strong> {estado.resultado.comprador?.email}
                </p>
                <p>
                  <strong>Matrícula:</strong>{" "}
                  {estado.resultado.comprador?.matricula}
                </p>
              </div>

              <div className='dados-evento' data-testid='dados-evento'>
                <h3>🎫 Dados do Evento</h3>
                <p>
                  <strong>Evento:</strong> {estado.resultado.evento?.nome}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {estado.resultado.evento
                    ? new Date(estado.resultado.evento.data).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Local:</strong> {estado.resultado.evento?.local}
                </p>
              </div>

              <div className='dados-validacao' data-testid='dados-validacao'>
                <h3>⏰ Dados da Validação</h3>
                <p>
                  <strong>Validado em:</strong>{" "}
                  {estado.resultado.dataValidacao
                    ? new Date(estado.resultado.dataValidacao).toLocaleString()
                    : "Agora"}
                </p>
                <p>
                  <strong>Hash:</strong>{" "}
                  <code>{estado.resultado.ingresso?.hash}</code>
                </p>
              </div>
            </div>
          ) : (
            <div className='ingresso-invalido' data-testid='ingresso-invalido'>
              <div className='status-header'>
                <h2>❌ Ingresso Inválido</h2>
                <p className='status-message'>Entrada não autorizada</p>
              </div>

              <div className='erro-detalhes' data-testid='erro-detalhes'>
                <p>
                  <strong>Motivo:</strong> {estado.resultado.error}
                </p>

                {estado.resultado.error?.includes("já utilizado") && (
                  <div className='alerta-usado'>
                    <p>⚠️ Este ingresso já foi utilizado anteriormente.</p>
                  </div>
                )}

                {estado.resultado.error?.includes("não encontrado") && (
                  <div className='alerta-nao-encontrado'>
                    <p>🔍 Ingresso não encontrado no sistema.</p>
                  </div>
                )}

                {estado.resultado.error?.includes("Hash inválido") && (
                  <div className='alerta-hash-invalido'>
                    <p>🚫 Código QR inválido ou corrompido.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleLimpar}
            className='limpar-resultado-btn'
            data-testid='limpar-resultado-btn'
          >
            Validar Outro Ingresso
          </button>
        </div>
      )}
    </div>
  );
};

export default ScannerIntegrado;
