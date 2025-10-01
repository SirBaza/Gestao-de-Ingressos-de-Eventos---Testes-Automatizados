import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CompraIntegrada from "../src/components/CompraIntegrada";
import { apiService } from "../src/services/api";

// Mock da API
jest.mock("../src/services/api");
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock do QRComponent
jest.mock("../src/components/QRComponent", () => {
  return function QRComponent({ value }: { value: string }) {
    return (
      <div data-testid='qr-component'>
        <div data-testid='qr-value'>{value}</div>
      </div>
    );
  };
});

describe("CompraIntegrada", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Fluxo de compra bem-sucedida", () => {
    test("deve realizar compra e exibir QR codes", async () => {
      const user = userEvent.setup();

      // Mock da resposta da API
      const mockResponse = {
        sucesso: true,
        compra: {
          id: 1,
          nome: "João Silva",
          email: "joao@teste.com",
          matricula: "123456",
          quantidade: 2,
          eventoId: 1,
          tipoIngressoId: 1,
          dataCompra: "2025-09-30T10:00:00.000Z",
        },
        ingressos: [
          { id: 1, hash: "abc123", usado: false, compraId: 1 },
          { id: 2, hash: "def456", usado: false, compraId: 1 },
        ],
        qrCodes: ["abc123", "def456"],
      };

      mockApiService.criarCompra.mockResolvedValue(mockResponse);

      render(<CompraIntegrada />);

      // Preencher formulário
      await user.type(screen.getByTestId("input-nome"), "João Silva");
      await user.type(screen.getByTestId("input-email"), "joao@teste.com");
      await user.type(screen.getByTestId("input-matricula"), "123456");
      fireEvent.change(screen.getByTestId("input-quantidade"), {
        target: { value: "2" },
      });

      // Submeter formulário
      const form = screen.getByTestId("compra-form");
      fireEvent.submit(form);

      // Verificar loading
      await waitFor(() => {
        expect(screen.getByTestId("carregando-compra")).toBeInTheDocument();
      });

      // Verificar sucesso
      await waitFor(() => {
        expect(screen.getByTestId("compra-sucesso")).toBeInTheDocument();
      });

      // Verificar detalhes da compra
      expect(screen.getByTestId("compra-detalhes")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("joao@teste.com")).toBeInTheDocument();

      // Verificar QR codes
      expect(screen.getByTestId("qr-codes-container")).toBeInTheDocument();
      expect(screen.getByTestId("qr-code-0")).toBeInTheDocument();
      expect(screen.getByTestId("qr-code-1")).toBeInTheDocument();

      // Verificar chamada da API
      expect(mockApiService.criarCompra).toHaveBeenCalledWith({
        nome: "João Silva",
        email: "joao@teste.com",
        matricula: "123456",
        quantidade: 2,
        eventoId: 1,
        tipoIngressoId: 1,
      });
    });

    test("deve permitir nova compra após sucesso", async () => {
      const user = userEvent.setup();

      // Mock da resposta da API
      const mockResponse = {
        sucesso: true,
        compra: {
          id: 1,
          nome: "João Silva",
          email: "joao@teste.com",
          matricula: "123456",
          quantidade: 1,
          eventoId: 1,
          tipoIngressoId: 1,
          dataCompra: "2025-09-30T10:00:00.000Z",
        },
        ingressos: [{ id: 1, hash: "abc123", usado: false, compraId: 1 }],
        qrCodes: ["abc123"],
      };

      mockApiService.criarCompra.mockResolvedValue(mockResponse);

      render(<CompraIntegrada />);

      // Realizar primeira compra
      await user.type(screen.getByTestId("input-nome"), "João Silva");
      await user.type(screen.getByTestId("input-email"), "joao@teste.com");
      await user.type(screen.getByTestId("input-matricula"), "123456");

      const form = screen.getByTestId("compra-form");
      fireEvent.submit(form);

      // Esperar sucesso
      await waitFor(() => {
        expect(screen.getByTestId("compra-sucesso")).toBeInTheDocument();
      });

      // Clicar em "Nova Compra"
      await user.click(screen.getByTestId("nova-compra-btn"));

      // Verificar que voltou ao formulário
      expect(screen.getByTestId("compra-integrada")).toBeInTheDocument();
      expect(screen.queryByTestId("compra-sucesso")).not.toBeInTheDocument();
    });
  });

  describe("Tratamento de erros", () => {
    test("deve exibir erro quando API falha", async () => {
      const user = userEvent.setup();

      mockApiService.criarCompra.mockRejectedValue(
        new Error("Evento não encontrado")
      );

      render(<CompraIntegrada />);

      // Preencher formulário
      await user.type(screen.getByTestId("input-nome"), "João Silva");
      await user.type(screen.getByTestId("input-email"), "joao@teste.com");
      await user.type(screen.getByTestId("input-matricula"), "123456");

      // Submeter formulário
      const form = screen.getByTestId("compra-form");
      fireEvent.submit(form);

      // Verificar erro
      await waitFor(() => {
        expect(screen.getByTestId("erro-compra")).toBeInTheDocument();
      });

      expect(screen.getByText(/Evento não encontrado/)).toBeInTheDocument();
    });

    test("deve permitir tentar novamente após erro", async () => {
      const user = userEvent.setup();

      mockApiService.criarCompra.mockRejectedValue(new Error("Erro de rede"));

      render(<CompraIntegrada />);

      // Preencher e submeter formulário
      await user.type(screen.getByTestId("input-nome"), "João Silva");
      await user.type(screen.getByTestId("input-email"), "joao@teste.com");
      await user.type(screen.getByTestId("input-matricula"), "123456");

      const form = screen.getByTestId("compra-form");
      fireEvent.submit(form);

      // Esperar erro
      await waitFor(() => {
        expect(screen.getByTestId("erro-compra")).toBeInTheDocument();
      });

      // Clicar em "Tentar Novamente"
      await user.click(screen.getByText("Tentar Novamente"));

      // Verificar que erro foi limpo
      expect(screen.queryByTestId("erro-compra")).not.toBeInTheDocument();
    });
  });
});
