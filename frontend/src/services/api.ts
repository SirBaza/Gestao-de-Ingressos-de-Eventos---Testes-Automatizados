// Configuração da API
const API_BASE_URL = "http://localhost:3001";

// Tipos para TypeScript
export interface CompraData {
  nome: string;
  email: string;
  matricula: string;
  quantidade: number;
  eventoId: number;
  tipoIngressoId: number;
}

export interface CompraResponse {
  sucesso: boolean;
  compra: {
    id: number;
    nome: string;
    email: string;
    matricula: string;
    quantidade: number;
    eventoId: number;
    tipoIngressoId: number;
    dataCompra: string;
  };
  ingressos: Array<{
    id: number;
    hash: string;
    usado: boolean;
    compraId: number;
  }>;
  qrCodes: string[];
}

export interface ValidacaoData {
  hash: string;
  payload?: any;
}

export interface ValidacaoResponse {
  valido: boolean;
  ingresso?: {
    id: number;
    hash: string;
    usado: boolean;
    compraId: number;
  };
  comprador?: {
    nome: string;
    email: string;
    matricula: string;
  };
  evento?: {
    nome: string;
    data: string;
    local: string;
  };
  dataValidacao?: string;
  error?: string;
}

// Serviço de API
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Erro de rede" }));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro desconhecido na requisição");
    }
  }

  // Realizar compra
  async criarCompra(data: CompraData): Promise<CompraResponse> {
    return this.request<CompraResponse>("/purchases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Validar ingresso
  async validarIngresso(data: ValidacaoData): Promise<ValidacaoResponse> {
    try {
      return await this.request<ValidacaoResponse>("/validate", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Transformar erro em resposta de validação
      return {
        valido: false,
        error: error instanceof Error ? error.message : "Erro na validação",
      };
    }
  }

  // Buscar eventos disponíveis
  async buscarEventos() {
    return this.request("/events");
  }
}

export const apiService = new ApiService();
