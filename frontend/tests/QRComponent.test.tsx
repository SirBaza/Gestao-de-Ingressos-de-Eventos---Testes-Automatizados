import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import QRComponent from "../src/components/QRComponent";

// Mock do QRCode antes de qualquer import
jest.mock("qrcode");

describe("QRComponent", () => {
  const mockOnError = jest.fn();
  let mockToDataURL: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnError.mockClear();

    // Criar o mock aqui para evitar problemas de hoisting
    mockToDataURL = jest.fn();
    const QRCode = require("qrcode");
    QRCode.toDataURL = mockToDataURL;
  });

  describe("Renderização de QR code válido", () => {
    test("deve renderizar QR code corretamente a partir da string recebida", async () => {
      const mockDataURL = "data:image/png;base64,mock-qr-code-data";
      mockToDataURL.mockResolvedValue(mockDataURL);

      render(<QRComponent value='test-qr-value' onError={mockOnError} />);

      // Inicialmente deve mostrar loading
      expect(screen.getByTestId("qr-loading")).toBeInTheDocument();

      // Aguardar o QR code ser gerado
      await waitFor(() => {
        expect(screen.getByTestId("qr-container")).toBeInTheDocument();
      });

      // Verificar se a imagem foi renderizada com o data URL correto
      const qrImage = screen.getByTestId("qr-image");
      expect(qrImage).toHaveAttribute("src", mockDataURL);
      expect(qrImage).toHaveAttribute("alt", "QR Code");

      // Verificar se o valor está sendo exibido
      expect(screen.getByTestId("qr-value")).toHaveTextContent("test-qr-value");

      // Verificar se QRCode.toDataURL foi chamado com parâmetros corretos
      expect(mockToDataURL).toHaveBeenCalledWith("test-qr-value", {
        width: 256,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    });

    test("deve usar tamanho personalizado quando fornecido", async () => {
      const mockDataURL = "data:image/png;base64,mock-qr-code-data";
      mockToDataURL.mockResolvedValue(mockDataURL);

      render(
        <QRComponent value='test-value' size={128} onError={mockOnError} />
      );

      await waitFor(() => {
        expect(screen.getByTestId("qr-container")).toBeInTheDocument();
      });

      const qrImage = screen.getByTestId("qr-image");
      expect(qrImage).toHaveAttribute("width", "128");
      expect(qrImage).toHaveAttribute("height", "128");

      expect(mockToDataURL).toHaveBeenCalledWith("test-value", {
        width: 128,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    });

    test("deve usar tamanho padrão de 256 quando não especificado", async () => {
      const mockDataURL = "data:image/png;base64,mock-qr-code-data";
      mockToDataURL.mockResolvedValue(mockDataURL);

      render(<QRComponent value='test-value' onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByTestId("qr-container")).toBeInTheDocument();
      });

      const qrImage = screen.getByTestId("qr-image");
      expect(qrImage).toHaveAttribute("width", "256");
      expect(qrImage).toHaveAttribute("height", "256");
    });

    test("deve regenerar QR code quando valor muda", async () => {
      const mockDataURL1 = "data:image/png;base64,mock-qr-code-data-1";
      const mockDataURL2 = "data:image/png;base64,mock-qr-code-data-2";

      mockToDataURL
        .mockResolvedValueOnce(mockDataURL1)
        .mockResolvedValueOnce(mockDataURL2);

      const { rerender } = render(
        <QRComponent value='value1' onError={mockOnError} />
      );

      await waitFor(() => {
        expect(screen.getByTestId("qr-container")).toBeInTheDocument();
      });

      expect(screen.getByTestId("qr-image")).toHaveAttribute(
        "src",
        mockDataURL1
      );

      // Mudar o valor
      rerender(<QRComponent value='value2' onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByTestId("qr-image")).toHaveAttribute(
          "src",
          mockDataURL2
        );
      });

      expect(mockToDataURL).toHaveBeenCalledTimes(2);
      expect(mockToDataURL).toHaveBeenNthCalledWith(
        1,
        "value1",
        expect.any(Object)
      );
      expect(mockToDataURL).toHaveBeenNthCalledWith(
        2,
        "value2",
        expect.any(Object)
      );
    });
  });

  describe("Exibição de fallback", () => {
    test("deve exibir fallback quando valor está vazio", async () => {
      render(<QRComponent value='' onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByTestId("qr-error")).toBeInTheDocument();
      });

      expect(screen.getByTestId("qr-error-message")).toHaveTextContent(
        "QR code value is required"
      );
      expect(mockOnError).toHaveBeenCalledWith("QR code value is required");
      expect(mockToDataURL).not.toHaveBeenCalled();
    });

    test("deve exibir fallback quando valor é apenas espaços em branco", async () => {
      render(<QRComponent value='   ' onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByTestId("qr-error")).toBeInTheDocument();
      });

      expect(screen.getByTestId("qr-error-message")).toHaveTextContent(
        "QR code value is required"
      );
      expect(mockOnError).toHaveBeenCalledWith("QR code value is required");
    });

    test("deve exibir fallback quando QR não pode ser gerado", async () => {
      mockToDataURL.mockRejectedValue(new Error("QR generation failed"));

      render(<QRComponent value='test-value' onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByTestId("qr-error")).toBeInTheDocument();
      });

      expect(screen.getByTestId("qr-error-message")).toHaveTextContent(
        "Failed to generate QR code"
      );
      expect(mockOnError).toHaveBeenCalledWith("Failed to generate QR code");
    });

    test("deve exibir fallback genérico quando data URL está vazio", async () => {
      mockToDataURL.mockResolvedValue("");

      render(<QRComponent value='test-value' onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByTestId("qr-fallback")).toBeInTheDocument();
      });

      expect(screen.getByTestId("qr-fallback")).toHaveTextContent(
        "QR Code não disponível"
      );
    });
  });

  describe("Estados de loading", () => {
    test("deve exibir indicador de loading durante geração", () => {
      // Mock para simular demora na geração
      mockToDataURL.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve("data:image/png;base64,mock"), 1000);
          })
      );

      render(<QRComponent value='test-value' onError={mockOnError} />);

      expect(screen.getByTestId("qr-loading")).toBeInTheDocument();
      expect(screen.getByTestId("qr-loading")).toHaveTextContent(
        "Gerando QR Code..."
      );
    });

    test("deve remover loading após geração bem-sucedida", async () => {
      const mockDataURL = "data:image/png;base64,mock-qr-code-data";
      mockToDataURL.mockResolvedValue(mockDataURL);

      render(<QRComponent value='test-value' onError={mockOnError} />);

      expect(screen.getByTestId("qr-loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId("qr-loading")).not.toBeInTheDocument();
      });

      expect(screen.getByTestId("qr-container")).toBeInTheDocument();
    });

    test("deve remover loading após erro", async () => {
      mockToDataURL.mockRejectedValue(new Error("Generation failed"));

      render(<QRComponent value='test-value' onError={mockOnError} />);

      expect(screen.getByTestId("qr-loading")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId("qr-loading")).not.toBeInTheDocument();
      });

      expect(screen.getByTestId("qr-error")).toBeInTheDocument();
    });
  });

  describe("Callback de erro", () => {
    test("deve chamar onError quando fornecido e ocorre erro", async () => {
      mockToDataURL.mockRejectedValue(new Error("Mock error"));

      render(<QRComponent value='test-value' onError={mockOnError} />);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith("Failed to generate QR code");
      });
    });

    test("deve não quebrar quando onError não é fornecido", async () => {
      mockToDataURL.mockRejectedValue(new Error("Mock error"));

      expect(() => {
        render(<QRComponent value='test-value' />);
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByTestId("qr-error")).toBeInTheDocument();
      });
    });

    test("deve chamar onError para valor vazio mesmo quando callback é opcional", async () => {
      render(<QRComponent value='' onError={mockOnError} />);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith("QR code value is required");
      });
    });
  });

  describe("Valores extremos e edge cases", () => {
    test("deve lidar com strings muito longas", async () => {
      const longValue = "a".repeat(1000);
      const mockDataURL = "data:image/png;base64,mock-long-qr";
      mockToDataURL.mockResolvedValue(mockDataURL);

      render(<QRComponent value={longValue} onError={mockOnError} />);

      await waitFor(() => {
        expect(screen.getByTestId("qr-container")).toBeInTheDocument();
      });

      expect(mockToDataURL).toHaveBeenCalledWith(longValue, expect.any(Object));
    });
  });
});
