import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

export interface QRComponentProps {
  value: string;
  size?: number;
  onError?: (error: string) => void;
}

const QRComponent: React.FC<QRComponentProps> = ({
  value,
  size = 256,
  onError,
}) => {
  const [qrDataURL, setQRDataURL] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const generateQR = async () => {
      if (!value || value.trim() === "") {
        const errorMsg = "QR code value is required";
        setError(errorMsg);
        setLoading(false);
        onError?.(errorMsg);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const dataURL = await QRCode.toDataURL(value, {
          width: size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });

        setQRDataURL(dataURL);
      } catch (err) {
        const errorMsg = "Failed to generate QR code";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [value, size, onError]);

  if (loading) {
    return (
      <div className='qr-loading' data-testid='qr-loading'>
        Gerando QR Code...
      </div>
    );
  }

  if (error) {
    return (
      <div className='qr-error' data-testid='qr-error'>
        <p>Erro ao gerar QR Code</p>
        <span data-testid='qr-error-message'>{error}</span>
      </div>
    );
  }

  if (!qrDataURL) {
    return (
      <div className='qr-fallback' data-testid='qr-fallback'>
        QR Code não disponível
      </div>
    );
  }

  return (
    <div className='qr-container' data-testid='qr-container'>
      <img
        src={qrDataURL}
        alt='QR Code'
        width={size}
        height={size}
        data-testid='qr-image'
      />
      <div className='qr-value' data-testid='qr-value'>
        {value}
      </div>
    </div>
  );
};

export default QRComponent;
