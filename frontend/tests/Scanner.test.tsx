import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Scanner from "../src/components/Scanner";

// Mock global para Math.random para tornar os testes determinísticos
const originalMathRandom = Math.random;

describe("Scanner", () => {
  const mockOnScan = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnScan.mockClear();
    mockOnError.mockClear();
    // Mockar Math.random para sempre retornar 0 (primeiro cenário - sucesso)
    Math.random = jest.fn(() => 0);
  });

  afterEach(() => {
    // Restaurar Math.random original
    Math.random = originalMathRandom;
  });

  describe("Renderização inicial", () => {
    test("deve renderizar o componente Scanner corretamente", () => {
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      expect(screen.getByTestId("scanner-container")).toBeInTheDocument();
      expect(screen.getByTestId("camera-scan-button")).toBeInTheDocument();
      expect(screen.getByTestId("manual-input")).toBeInTheDocument();
      expect(screen.getByTestId("manual-submit-button")).toBeInTheDocument();
    });

    test("deve ter placeholder correto no input manual", () => {
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const input = screen.getByTestId("manual-input");
      expect(input).toHaveAttribute(
        "placeholder",
        "Cole ou digite o código QR aqui"
      );
    });

    test("deve ter botões de controle disponíveis", () => {
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      expect(screen.getByTestId("camera-scan-button")).toHaveTextContent(
        "Escanear com Câmera"
      );
      expect(screen.getByTestId("simulate-error-button")).toHaveTextContent(
        "Simular Erro"
      );
      expect(screen.getByTestId("clear-scan-button")).toHaveTextContent(
        "Limpar"
      );
      expect(screen.getByTestId("upload-button")).toHaveTextContent(
        "Upload Imagem com QR"
      );
    });
  });

  describe("Input manual", () => {
    test("deve processar código quando Enter é pressionado no input", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const input = screen.getByTestId("manual-input");

      await user.type(input, "test-qr-code{enter}");

      await waitFor(
        () => {
          expect(mockOnScan).toHaveBeenCalledWith("test-qr-code");
        },
        { timeout: 1000 }
      );
    });

    test("deve processar código quando botão Processar é clicado", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const input = screen.getByTestId("manual-input");
      const button = screen.getByTestId("manual-submit-button");

      await user.type(input, "manual-test-code");
      await user.click(button);

      await waitFor(
        () => {
          expect(mockOnScan).toHaveBeenCalledWith("manual-test-code");
        },
        { timeout: 1000 }
      );
    });

    test("deve chamar onError quando valor está vazio", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const button = screen.getByTestId("manual-submit-button");

      await user.click(button);

      expect(mockOnError).toHaveBeenCalledWith("QR code value cannot be empty");
    });

    test("deve chamar onError quando valor é apenas espaços em branco", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const input = screen.getByTestId("manual-input");
      const button = screen.getByTestId("manual-submit-button");

      await user.type(input, "   ");
      await user.click(button);

      expect(mockOnError).toHaveBeenCalledWith("QR code value cannot be empty");
    });

    test("deve limpar input após processamento", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const input = screen.getByTestId("manual-input") as HTMLInputElement;
      const button = screen.getByTestId("manual-submit-button");

      await user.type(input, "clear-test");
      await user.click(button);

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });
  });

  describe("Escaneamento com câmera simulado", () => {
    test("deve chamar onScan após escaneamento bem-sucedido", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const cameraButton = screen.getByTestId("camera-scan-button");

      await user.click(cameraButton);

      expect(screen.getByTestId("scanning-indicator")).toBeInTheDocument();

      await waitFor(
        () => {
          expect(mockOnScan).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    test("deve exibir indicador de loading durante escaneamento", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const cameraButton = screen.getByTestId("camera-scan-button");

      await user.click(cameraButton);

      expect(screen.getByTestId("scanning-indicator")).toBeInTheDocument();
      expect(screen.getByTestId("scanning-indicator")).toHaveTextContent(
        "Processando QR Code..."
      );
    });

    test("deve desabilitar botões durante escaneamento", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const cameraButton = screen.getByTestId("camera-scan-button");

      await user.click(cameraButton);

      expect(cameraButton).toBeDisabled();
      expect(screen.getByTestId("manual-input")).toBeDisabled();
      expect(screen.getByTestId("manual-submit-button")).toBeDisabled();
    });
  });

  describe("Simulação de erro", () => {
    test("deve chamar onError quando botão Simular Erro é clicado", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const errorButton = screen.getByTestId("simulate-error-button");

      await user.click(errorButton);

      await waitFor(
        () => {
          expect(mockOnError).toHaveBeenCalledWith(
            "Could not read QR code. Please try again."
          );
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Gerenciamento de último scan", () => {
    test("deve exibir último código escaneado", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const input = screen.getByTestId("manual-input");

      await user.type(input, "display-test{enter}");

      await waitFor(
        () => {
          expect(screen.getByTestId("last-scan-result")).toBeInTheDocument();
          expect(screen.getByTestId("last-scan-value")).toHaveTextContent(
            "display-test"
          );
        },
        { timeout: 1000 }
      );
    });

    test("deve limpar último scan quando botão Limpar é clicado", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const input = screen.getByTestId("manual-input");

      // Primeiro fazer um scan
      await user.type(input, "clear-test{enter}");

      await waitFor(() => {
        expect(screen.getByTestId("last-scan-result")).toBeInTheDocument();
      });

      // Depois limpar
      const clearButton = screen.getByTestId("clear-scan-button");
      await user.click(clearButton);

      expect(screen.queryByTestId("last-scan-result")).not.toBeInTheDocument();
    });

    test("deve desabilitar botão Limpar quando não há último scan", () => {
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const clearButton = screen.getByTestId("clear-scan-button");
      expect(clearButton).toBeDisabled();
    });
  });

  describe("Upload de arquivo", () => {
    test("deve processar arquivo quando selecionado", async () => {
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const fileInput = screen.getByTestId("file-input");
      const file = new File(["dummy content"], "qr-image.png", {
        type: "image/png",
      });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByTestId("scanning-indicator")).toBeInTheDocument();

      await waitFor(
        () => {
          expect(mockOnScan).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    test("deve abrir seletor de arquivo quando botão Upload é clicado", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const uploadButton = screen.getByTestId("upload-button");
      const fileInput = screen.getByTestId("file-input");

      const clickSpy = jest.spyOn(fileInput, "click");

      await user.click(uploadButton);

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("Props disabled", () => {
    test("deve desabilitar todos os controles quando disabled=true", () => {
      render(
        <Scanner onScan={mockOnScan} onError={mockOnError} disabled={true} />
      );

      expect(screen.getByTestId("camera-scan-button")).toBeDisabled();
      expect(screen.getByTestId("simulate-error-button")).toBeDisabled();
      expect(screen.getByTestId("manual-input")).toBeDisabled();
      expect(screen.getByTestId("manual-submit-button")).toBeDisabled();
      expect(screen.getByTestId("upload-button")).toBeDisabled();
    });

    test("deve manter controles habilitados quando disabled=false", () => {
      render(
        <Scanner onScan={mockOnScan} onError={mockOnError} disabled={false} />
      );

      expect(screen.getByTestId("camera-scan-button")).not.toBeDisabled();
      expect(screen.getByTestId("simulate-error-button")).not.toBeDisabled();
      expect(screen.getByTestId("manual-input")).not.toBeDisabled();
      expect(screen.getByTestId("manual-submit-button")).not.toBeDisabled();
      expect(screen.getByTestId("upload-button")).not.toBeDisabled();
    });
  });

  describe("Valores extremos e edge cases", () => {
    test("deve lidar com códigos muito longos", async () => {
      const user = userEvent.setup();
      render(<Scanner onScan={mockOnScan} onError={mockOnError} />);

      const longCode = "a".repeat(1000);
      const input = screen.getByTestId("manual-input");

      await user.type(input, longCode + "{enter}");

      await waitFor(
        () => {
          expect(mockOnScan).toHaveBeenCalledWith(longCode);
        },
        { timeout: 1000 }
      );
    });
  });
});
