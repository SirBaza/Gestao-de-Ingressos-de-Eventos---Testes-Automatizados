import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-desenvolvimento';

interface TokenPayload {
  id: string;
  email: string;
  tipoUsuario: 'organizador' | 'comprador';
}

export const middlewareAutenticacao = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ mensagem: 'Token de acesso não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ mensagem: 'Token de acesso não fornecido' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ mensagem: 'Token inválido' });
  }
};

export const middlewareOrganizador = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ mensagem: 'Usuário não autenticado' });
    return;
  }

  if (req.user.tipoUsuario !== 'organizador') {
    res.status(403).json({ mensagem: 'Acesso restrito a organizadores' });
    return;
  }

  next();
};
