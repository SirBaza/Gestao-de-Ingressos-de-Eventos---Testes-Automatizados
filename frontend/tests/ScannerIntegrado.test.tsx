import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScannerIntegrado from "../src/components/ScannerIntegrado";
import * as api from "../src/services/api";

// Mock manual do apiService
class MockApiService {
  validarIngressoResponses: any[] = [];
  validarIngressoCalls: any[] = [];

  mockValidarIngressoResolve(value: any) {
    this.validarIngressoResponses.push({ type: 'resolve', value });
  }

  mockValidarIngressoReject(error: Error) {
    this.validarIngressoResponses.push({ type: 'reject', error });
  }

  async validarIngresso(data: any) {
    this.validarIngressoCalls.push(data);
    const response = this.validarIngressoResponses.shift();

    if (!response) {
      throw new Error('No mock response configured');
    }

    if (response.type === 'reject') {
      throw response.error;
    }

    return response.value;
  }

  async criarCompra(data: any) {
    return { sucesso: false };
  }

  clear() {
    this.validarIngressoResponses = [];
    this.validarIngressoCalls = [];
  }
}

describe("ScannerIntegrado - Testes Essenciais", () => {
  let mockApiService: MockApiService;
  let originalApiService: any;

  beforeEach(() => {
    mockApiService = new MockApiService();
    originalApiService = api.apiService;
    (api as any).apiService = mockApiService;
  });

  afterEach(() => {
    (api as any).apiService = originalApiService;
  });

  test("deve validar ingresso válido", async () => {
    const mockResponse = {
      valido: true,
      ingresso: { id: 1, hash: "abc123", usado: false, compraId: 1 },
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
    };

    mockApiService.mockValidarIngressoResolve(mockResponse);

    render(<ScannerIntegrado />);

    // Usar o test-id correto do componente real
    const input = screen.getByTestId("manual-input");
    fireEvent.change(input, { target: { value: "abc123" } });

    // Clicar no botão de processar
    fireEvent.click(screen.getByTestId("manual-submit-button"));

    await waitFor(() => {
      expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ingresso-valido")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  test("deve tratar ingresso inválido", async () => {
    mockApiService.mockValidarIngressoResolve({
      valido: false,
      error: "Ingresso não encontrado",
    });

    render(<ScannerIntegrado />);

    // Usar o test-id correto do componente real
    const input = screen.getByTestId("manual-input");
    fireEvent.change(input, { target: { value: "hash-inexistente" } });

    // Clicar no botão de processar
    fireEvent.click(screen.getByTestId("manual-submit-button"));

    await waitFor(() => {
      expect(screen.getByTestId("resultado-validacao")).toBeInTheDocument();
    });

    expect(screen.getByTestId("ingresso-invalido")).toBeInTheDocument();
    expect(screen.getByText("Ingresso não encontrado")).toBeInTheDocument();
  });
});
