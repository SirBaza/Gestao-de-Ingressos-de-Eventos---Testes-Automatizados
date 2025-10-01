import { apiService } from "../src/services/api";

// Mock global do fetch
global.fetch = jest.fn();

describe("ApiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("criarCompra", () => {
    test("deve fazer requisição POST para /purchases com dados corretos", async () => {
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const compraData = {
        nome: "João Silva",
        email: "joao@teste.com",
        matricula: "123456",
        quantidade: 1,
        eventoId: 1,
        tipoIngressoId: 1,
      };

      const result = await apiService.criarCompra(compraData);

      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(compraData),
      });

      expect(result).toEqual(mockResponse);
    });

    test("deve retornar erro quando requisição falha", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Dados inválidos" }),
      });

      const compraData = {
        nome: "João",
        email: "joao@teste.com",
        matricula: "123",
        quantidade: 1,
        eventoId: 1,
        tipoIngressoId: 1,
      };

      await expect(apiService.criarCompra(compraData)).rejects.toThrow(
        "Dados inválidos"
      );
    });

    test("deve lidar com erro de rede", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const compraData = {
        nome: "João",
        email: "joao@teste.com",
        matricula: "123",
        quantidade: 1,
        eventoId: 1,
        tipoIngressoId: 1,
      };

      await expect(apiService.criarCompra(compraData)).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("validarIngresso", () => {
    test("deve fazer requisição POST para /validate com hash", async () => {
      const mockResponse = {
        valido: true,
        ingresso: {
          id: 1,
          hash: "abc123",
          usado: false,
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

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const validationData = {
        hash: "abc123",
      };

      const result = await apiService.validarIngresso(validationData);

      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validationData),
      });

      expect(result).toEqual(mockResponse);
    });

    test("deve retornar erro quando validação falha", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Ingresso não encontrado" }),
      });

      const result = await apiService.validarIngresso({
        hash: "invalid-hash",
      });

      expect(result).toEqual({
        valido: false,
        error: "Ingresso não encontrado",
      });
    });

    test("deve lidar com erro de rede na validação", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Connection timeout")
      );

      const result = await apiService.validarIngresso({
        hash: "test-hash",
      });

      expect(result).toEqual({
        valido: false,
        error: "Connection timeout",
      });
    });
  });

  describe("buscarEventos", () => {
    test("deve fazer requisição GET para /events", async () => {
      const mockEventos = [
        {
          id: 1,
          nome: "Evento Teste",
          data: "2025-12-01T20:00:00.000Z",
          local: "Centro de Convenções",
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEventos,
      });

      const result = await apiService.buscarEventos();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/events", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(result).toEqual(mockEventos);
    });
  });
});
