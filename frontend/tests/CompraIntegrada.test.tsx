import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CompraIntegrada from "../src/components/CompraIntegrada";
import * as api from "../src/services/api";

// Mock manual do apiService
class MockApiService {
  criarCompraResponses: any[] = [];
  criarCompraCalls: any[] = [];

  mockCriarCompraResolve(value: any) {
    this.criarCompraResponses.push({ type: 'resolve', value });
  }

  mockCriarCompraReject(error: Error) {
    this.criarCompraResponses.push({ type: 'reject', error });
  }

  async criarCompra(data: any) {
    this.criarCompraCalls.push(data);
    const response = this.criarCompraResponses.shift();

    if (!response) {
      throw new Error('No mock response configured');
    }

    if (response.type === 'reject') {
      throw response.error;
    }

    return response.value;
  }

  async validarIngresso(data: any) {
    return { valido: false };
  }

  clear() {
    this.criarCompraResponses = [];
    this.criarCompraCalls = [];
  }
}

// Mock do QRComponent
const QRComponent = ({ value }: { value: string }) => {
  return (
    <div data-testid='qr-component'>
      <div data-testid='qr-value'>{value}</div>
    </div>
  );
};

describe("CompraIntegrada - Testes Essenciais", () => {
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

  test("deve realizar compra com sucesso", async () => {
    const user = userEvent.setup();

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

    mockApiService.mockCriarCompraResolve(mockResponse);

    render(<CompraIntegrada />);

    await user.type(screen.getByTestId("input-nome"), "João Silva");
    await user.type(screen.getByTestId("input-email"), "joao@teste.com");
    await user.type(screen.getByTestId("input-matricula"), "123456");

    fireEvent.submit(screen.getByTestId("compra-form"));

    await waitFor(() => {
      expect(screen.getByTestId("compra-sucesso")).toBeInTheDocument();
    });

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByTestId("qr-codes-container")).toBeInTheDocument();
  });

  test("deve tratar erro na compra", async () => {
    const user = userEvent.setup();

    mockApiService.mockCriarCompraReject(
      new Error("Evento não encontrado")
    );

    render(<CompraIntegrada />);

    await user.type(screen.getByTestId("input-nome"), "João Silva");
    await user.type(screen.getByTestId("input-email"), "joao@teste.com");
    await user.type(screen.getByTestId("input-matricula"), "123456");

    fireEvent.submit(screen.getByTestId("compra-form"));

    await waitFor(() => {
      expect(screen.getByTestId("erro-compra")).toBeInTheDocument();
    });

    expect(screen.getByText(/Evento não encontrado/)).toBeInTheDocument();
  });
});
