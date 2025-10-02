import React, { useState, useEffect } from "react";
import CompraForm, { CompraFormData } from "./CompraForm";
import QRComponent from "./QRComponent";
import { apiService, CompraResponse } from "../services/api";

export interface CompraIntegradaProps {
  eventoId?: number;
  tipoIngressoId?: number;
}

interface CompraEstado {
  carregando: boolean;
  erro: string | null;
  sucesso: boolean;
  compraRealizada: CompraResponse | null;
}

const CompraIntegrada: React.FC<CompraIntegradaProps> = ({
  eventoId = 1,
  tipoIngressoId = 1,
}) => {
  const [estado, setEstado] = useState<CompraEstado>({
    carregando: false,
    erro: null,
    sucesso: false,
    compraRealizada: null,
  });

  const handleSubmit = async (formData: CompraFormData) => {
    setEstado({
      carregando: true,
      erro: null,
      sucesso: false,
      compraRealizada: null,
    });

    try {
      const compraData = {
        ...formData,
        eventoId,
        tipoIngressoId,
      };

      const resultado = await apiService.criarCompra(compraData);

      setEstado({
        carregando: false,
        erro: null,
        sucesso: true,
        compraRealizada: resultado,
      });
    } catch (error) {
      setEstado({
        carregando: false,
        erro: error instanceof Error ? error.message : "Erro na compra",
        sucesso: false,
        compraRealizada: null,
      });
    }
  };

  const handleNovaCompra = () => {
    setEstado({
      carregando: false,
      erro: null,
      sucesso: false,
      compraRealizada: null,
    });
  };

  if (estado.sucesso && estado.compraRealizada) {
    return (
      <div className='compra-sucesso' data-testid='compra-sucesso'>
        <div className='sucesso-header'>
          <h2>🎉 Compra Realizada com Sucesso!</h2>
          <p>Seus ingressos foram gerados com sucesso.</p>
        </div>

        <div className='compra-detalhes' data-testid='compra-detalhes'>
          <h3>Detalhes da Compra</h3>
          <p>
            <strong>Nome:</strong> {estado.compraRealizada.compra.nome}
          </p>
          <p>
            <strong>Email:</strong> {estado.compraRealizada.compra.email}
          </p>
          <p>
            <strong>Matrícula:</strong>{" "}
            {estado.compraRealizada.compra.matricula}
          </p>
          <p>
            <strong>Quantidade:</strong>{" "}
            {estado.compraRealizada.compra.quantidade}
          </p>
          <p>
            <strong>Data da Compra:</strong>{" "}
            {new Date(
              estado.compraRealizada.compra.dataCompra
            ).toLocaleString()}
          </p>
        </div>

        <div className='qr-codes-container' data-testid='qr-codes-container'>
          <h3>Seus QR Codes</h3>
          <p>Guarde estes códigos para apresentar no evento:</p>

          {estado.compraRealizada.qrCodes.map((qrCode, index) => (
            <div
              key={index}
              className='qr-code-item'
              data-testid={`qr-code-${index}`}
            >
              <h4>Ingresso {index + 1}</h4>
              <QRComponent value={qrCode} />
              <p className='qr-hash' data-testid={`qr-hash-${index}`}>
                <small>
                  Hash: {estado.compraRealizada!.ingressos[index].hash}
                </small>
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleNovaCompra}
          className='nova-compra-btn'
          data-testid='nova-compra-btn'
        >
          Realizar Nova Compra
        </button>
      </div>
    );
  }

  return (
    <div className='compra-integrada' data-testid='compra-integrada'>
      <h1>Compra de Ingressos</h1>

      {estado.erro && (
        <div className='erro' data-testid='erro-compra'>
          <p>❌ {estado.erro}</p>
          <button onClick={handleNovaCompra}>Tentar Novamente</button>
        </div>
      )}

      <CompraForm onSubmit={handleSubmit} loading={estado.carregando} />

      {estado.carregando && (
        <div className='carregando' data-testid='carregando-compra'>
          <p>Processando sua compra...</p>
        </div>
      )}
    </div>
  );
};

export default CompraIntegrada;
