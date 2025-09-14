// Extensão dos tipos do Express para incluir propriedades customizadas
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tipoUsuario: 'organizador' | 'comprador';
      };
    }
  }
}

export {};
