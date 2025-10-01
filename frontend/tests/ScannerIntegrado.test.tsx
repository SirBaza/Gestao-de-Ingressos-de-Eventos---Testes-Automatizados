import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScannerIntegrado from "../src/components/ScannerIntegrado";
import { apiService } from "../src/services/api";

// Mock da API
jest.mock("../src/services/api");
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock do Scanner
jest.mock("../src/components/Scanner", () => {
  return function Scanner({ onScan, onError, disabled }: any) {
    return (
      <div data-testid='scanner-mock'>
        <input
          data-testid='scanner-input'
          placeholder='Digite o hash do QR code'
          disabled={disabled}
          onChange={(e) => {
            if (e.target.value) {
              onScan(e.target.value);
            }
          }}
        />
        <button
          data-testid='scanner-error'
          onClick={() => onError("Erro simulado")}
        >
          Simular Erro
        </button>
      </div>
    );
  };
});

describe("ScannerIntegrado", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Validação bem-sucedida", () => {
    test("deve validar ingresso e exibir dados do comprador", async () => {
      const user = userEvent.setup();

      // Mock da resposta da API
      const mockResponse = {
        valido: true,
        ingresso: {
          id: 1,
          hash: "abc123",
          usado: true,
          compraId: 1,
        },
        comprador: {
          nome: "João Silva",
          email: "joao@teste.com",
          matricula: "123456",
        },
        evento: {
          nome: "Evento Teste",
          data: "2025-12-01T20:00:00.000Z",
          local: "Centro de Convenções",
        },
        dataValidacao: "2025-09-30T10:00:00.000Z",
      };

      // Mock da API com um pequeno delay para capturar o estado de loading
      mockApiService.validarIngresso.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
      );

      render(<ScannerIntegrado />);

      // Simular scan
      fireEvent.change(screen.getByTestId("scanner-input"), {
        target: { value: "abc123" },
      });

      // Verificar loading
      await waitFor(() => {
        expect(screen.getByTestId("carregando-validacao")).toBeInTheDocument();
      });

      // Verificar resultado válido
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      expect(screen.getByTestId("ingresso-valido")).toBeInTheDocument();
      expect(screen.getByText("✅ Ingresso Válido!")).toBeInTheDocument();

      // Verificar dados do comprador
      expect(screen.getByTestId("dados-comprador")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("joao@teste.com")).toBeInTheDocument();
      expect(screen.getByText("123456")).toBeInTheDocument();

      // Verificar dados do evento
      expect(screen.getByTestId("dados-evento")).toBeInTheDocument();
      expect(screen.getByText("Evento Teste")).toBeInTheDocument();
      expect(screen.getByText("Centro de Convenções")).toBeInTheDocument();

      // Verificar dados da validação
      expect(screen.getByTestId("dados-validacao")).toBeInTheDocument();
      expect(screen.getByText("abc123")).toBeInTheDocument();

      // Verificar chamada da API
      expect(mockApiService.validarIngresso).toHaveBeenCalledWith({
        hash: "abc123",
      });
    });
  });

  describe("Validação com erro", () => {
    test("deve exibir erro quando ingresso não existe", async () => {
      const user = userEvent.setup();

      mockApiService.validarIngresso.mockResolvedValue({
        valido: false,
        error: "Ingresso não encontrado",
      });

      render(<ScannerIntegrado />);

      // Simular scan
      await user.type(screen.getByTestId("scanner-input"), "hash-inexistente");

      // Verificar resultado inválido
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      expect(screen.getByTestId("ingresso-invalido")).toBeInTheDocument();
      expect(screen.getByText("❌ Ingresso Inválido")).toBeInTheDocument();
      expect(screen.getByText("Ingresso não encontrado")).toBeInTheDocument();
    });

    test("deve exibir alerta específico para ingresso já usado", async () => {
      const user = userEvent.setup();

      mockApiService.validarIngresso.mockResolvedValue({
        valido: false,
        error: "Ingresso já utilizado",
      });

      render(<ScannerIntegrado />);

      // Simular scan
      await user.type(screen.getByTestId("scanner-input"), "hash-usado");

      // Verificar resultado inválido
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      expect(screen.getByTestId("ingresso-invalido")).toBeInTheDocument();
      expect(screen.getByText("Ingresso já utilizado")).toBeInTheDocument();
      expect(
        screen.getByText(/Este ingresso já foi utilizado anteriormente/)
      ).toBeInTheDocument();
    });

    test("deve tratar erro de scanner", async () => {
      const user = userEvent.setup();

      render(<ScannerIntegrado />);

      // Simular erro do scanner
      await user.click(screen.getByTestId("scanner-error"));

      // Verificar resultado de erro
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      expect(screen.getByTestId("ingresso-invalido")).toBeInTheDocument();
      expect(screen.getByText("Erro simulado")).toBeInTheDocument();
    });
  });

  describe("Limpar resultado", () => {
    test("deve permitir validar outro ingresso após resultado", async () => {
      const user = userEvent.setup();

      mockApiService.validarIngresso.mockResolvedValue({
        valido: false,
        error: "Teste",
      });

      render(<ScannerIntegrado />);

      // Simular scan
      await user.type(screen.getByTestId("scanner-input"), "test");

      // Esperar resultado
      await waitFor(() => {
        expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
      });

      // Clicar em limpar
      await user.click(screen.getByTestId("limpar-resultado-btn"));

      // Verificar que resultado foi limpo
      expect(
        screen.queryByTestId("resultado-validacao")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("carregando-validacao")
      ).not.toBeInTheDocument();
    });
  });
});
