import { apiService } from "../src/services/api";

// Mock manual do fetch
class MockFetch {
  calls: any[] = [];
  mockResponses: any[] = [];
  
  setup() {
    const originalFetch = global.fetch;
    global.fetch = ((...args: any[]) => {
      this.calls.push(args);
      
      const response = this.mockResponses.shift();
      if (response instanceof Error) {
        return Promise.reject(response);
      }
      return Promise.resolve(response);
    }) as any;
    
    return originalFetch;
  }
  
  mockResolvedValue(value: any) {
    this.mockResponses.push({
      ok: true,
      json: async () => value,
    });
  }
  
  mockRejectedValue(error: Error) {
    this.mockResponses.push(error);
  }
  
  clear() {
    this.calls = [];
    this.mockResponses = [];
  }
  
  wasCalledWith(url: string, options: any) {
    return this.calls.some(call => {
      const callUrl = call[0];
      const callOptions = call[1];
      
      if (callUrl !== url) return false;
      
      // Comparar as propriedades importantes
      return callOptions.method === options.method &&
             JSON.stringify(callOptions.headers) === JSON.stringify(options.headers) &&
             callOptions.body === options.body;
    });
  }
}

describe("ApiService - Testes Essenciais", () => {
  let mockFetch: MockFetch;
  let originalFetch: any;

  beforeEach(() => {
    mockFetch = new MockFetch();
    originalFetch = mockFetch.setup();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("deve criar compra com sucesso", async () => {
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

    mockFetch.mockResolvedValue(mockResponse);

    const compraData = {
      nome: "João Silva",
      email: "joao@teste.com",
      matricula: "123456",
      quantidade: 1,
      eventoId: 1,
      tipoIngressoId: 1,
    };

    const result = await apiService.criarCompra(compraData);

    expect(mockFetch.wasCalledWith("http://localhost:3001/purchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(compraData),
    })).toBe(true);
    expect(result).toEqual(mockResponse);
  });

  test("deve validar ingresso com sucesso", async () => {
    const mockResponse = {
      valido: true,
      ingresso: { id: 1, hash: "abc123", usado: false, compraId: 1 },
      comprador: {
        nome: "João Silva",
        email: "joao@teste.com",
        matricula: "123456",
      },
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await apiService.validarIngresso({ hash: "abc123" });

    expect(mockFetch.wasCalledWith("http://localhost:3001/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hash: "abc123" }),
    })).toBe(true);
    expect(result).toEqual(mockResponse);
  });

  test("deve tratar erro na validação", async () => {
    mockFetch.mockRejectedValue(new Error("Erro de rede"));

    const result = await apiService.validarIngresso({ hash: "test-hash" });

    expect(result).toEqual({
      valido: false,
      error: "Erro de rede",
    });
  });
});
