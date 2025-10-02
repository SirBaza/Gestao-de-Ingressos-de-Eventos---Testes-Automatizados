import React, { useState, useRef } from "react";

export interface ScannerProps {
  onScan: (result: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export interface ScanResult {
  text: string;
  timestamp: number;
}

const Scanner: React.FC<ScannerProps> = ({
  onScan,
  onError,
  disabled = false,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScan, setLastScan] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simula a leitura de QR code através de input de texto (para testes)
  const handleManualInput = (value: string) => {
    if (!value.trim()) {
      const error = "QR code value cannot be empty";
      onError(error);
      return;
    }

    try {
      // Simula delay de leitura
      setIsScanning(true);

      setTimeout(() => {
        setLastScan(value);
        setIsScanning(false);
        onScan(value);
      }, 500);
    } catch (err) {
      const error = "Failed to process QR code";
      setIsScanning(false);
      onError(error);
    }
  };

  // Simula erro de leitura
  const simulateError = () => {
    setIsScanning(true);

    setTimeout(() => {
      const error = "Could not read QR code. Please try again.";
      setIsScanning(false);
      onError(error);
    }, 500);
  };

  // Simula leitura através de "câmera" (para testes)
  const handleCameraScan = () => {
    if (disabled || isScanning) return;

    setIsScanning(true);

    // Simula diferentes cenários de leitura
    const scenarios = [
      () => {
        // Sucesso - hash válido
        const mockHash =
          "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890abcdef12";
        setTimeout(() => {
          setLastScan(mockHash);
          setIsScanning(false);
          onScan(mockHash);
        }, 1000);
      },
      () => {
        // Erro de leitura
        setTimeout(() => {
          const error = "Camera failed to read QR code";
          setIsScanning(false);
          onError(error);
        }, 1000);
      },
      () => {
        // QR code inválido
        setTimeout(() => {
          const error = "Invalid QR code format";
          setIsScanning(false);
          onError(error);
        }, 800);
      },
    ];

    // Escolhe um cenário aleatório (para testes será controlado via props)
    const randomScenario =
      scenarios[Math.floor(Math.random() * scenarios.length)];
    randomScenario();
  };

  // Função para limpar último scan
  const clearLastScan = () => {
    setLastScan("");
  };

  return (
    <div className='scanner-container' data-testid='scanner-container'>
      <div className='scanner-controls'>
        <button
          onClick={handleCameraScan}
          disabled={disabled || isScanning}
          data-testid='camera-scan-button'
          className='scan-button'
        >
          {isScanning ? "Escaneando..." : "Escanear com Câmera"}
        </button>

        <button
          onClick={simulateError}
          disabled={disabled || isScanning}
          data-testid='simulate-error-button'
          className='error-button'
        >
          Simular Erro
        </button>

        <button
          onClick={clearLastScan}
          disabled={disabled || !lastScan}
          data-testid='clear-scan-button'
          className='clear-button'
        >
          Limpar
        </button>
      </div>

      <div className='manual-input-section'>
        <label htmlFor='manual-qr-input'>Ou digite o código manualmente:</label>
        <div className='input-group'>
          <input
            id='manual-qr-input'
            type='text'
            placeholder='Cole ou digite o código QR aqui'
            disabled={disabled || isScanning}
            data-testid='manual-input'
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const target = e.target as HTMLInputElement;
                handleManualInput(target.value);
                target.value = "";
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                "manual-qr-input"
              ) as HTMLInputElement;
              if (input) {
                handleManualInput(input.value);
                input.value = "";
              }
            }}
            disabled={disabled || isScanning}
            data-testid='manual-submit-button'
          >
            Processar
          </button>
        </div>
      </div>

      {isScanning && (
        <div className='scanning-indicator' data-testid='scanning-indicator'>
          <div className='spinner'>⏳</div>
          <p>Processando QR Code...</p>
        </div>
      )}

      {lastScan && (
        <div className='last-scan-result' data-testid='last-scan-result'>
          <p>Último código escaneado:</p>
          <code data-testid='last-scan-value'>{lastScan}</code>
        </div>
      )}

      {/* Input file oculto para simular upload de imagem com QR */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        style={{ display: "none" }}
        data-testid='file-input'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Simula processamento de arquivo
            setIsScanning(true);
            setTimeout(() => {
              const mockResult = `qr_from_file_${Date.now()}`;
              setLastScan(mockResult);
              setIsScanning(false);
              onScan(mockResult);
            }, 1500);
          }
        }}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isScanning}
        data-testid='upload-button'
        className='upload-button'
      >
        Upload Imagem com QR
      </button>
    </div>
  );
};

export default Scanner;
