import axios, { AxiosInstance, AxiosResponse } from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ServicoApi {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autorização
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas e erros
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticação
  async login(email: string, senha: string) {
    const response = await this.api.post('/auth/login', { email, senha });
    return response.data;
  }

  async registrar(dadosUsuario: any) {
    const response = await this.api.post('/auth/registrar', dadosUsuario);
    return response.data;
  }

  async perfil() {
    const response = await this.api.get('/auth/perfil');
    return response.data;
  }

  // Métodos de eventos
  async listarEventos() {
    const response = await this.api.get('/eventos');
    return response.data;
  }

  async buscarEvento(id: string) {
    const response = await this.api.get(`/eventos/${id}`);
    return response.data;
  }

  async criarEvento(dadosEvento: any) {
    const response = await this.api.post('/eventos', dadosEvento);
    return response.data;
  }

  async listarEventosOrganizador() {
    const response = await this.api.get('/eventos/organizador/meus');
    return response.data;
  }

  async atualizarEvento(id: string, dadosAtualizacao: any) {
    const response = await this.api.put(`/eventos/${id}`, dadosAtualizacao);
    return response.data;
  }

  async removerEvento(id: string) {
    const response = await this.api.delete(`/eventos/${id}`);
    return response.data;
  }

  // Métodos de ingressos
  async comprarIngresso(dadosCompra: any) {
    const response = await this.api.post('/ingressos/comprar', dadosCompra);
    return response.data;
  }

  async listarIngressosComprador(email: string) {
    const response = await this.api.get(`/ingressos/comprador/${email}`);
    return response.data;
  }

  async buscarIngresso(id: string) {
    const response = await this.api.get(`/ingressos/${id}`);
    return response.data;
  }

  async validarIngresso(codigoQr: string) {
    const response = await this.api.post('/ingressos/validar', { codigoQr });
    return response.data;
  }

  async estatisticasEvento(eventoId: string) {
    const response = await this.api.get(`/ingressos/evento/${eventoId}/estatisticas`);
    return response.data;
  }

  // Método para verificar saúde da API
  async verificarSaude() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ServicoApi();
