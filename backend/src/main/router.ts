import express, { Request, Response } from 'express';
import cors from 'cors';
import { makeCriarEventoController } from './factories/make-criar-evento-controller';
import { makeListarEventosController } from './factories/make-listar-eventos-controller';
import { makeComprarIngressoController } from './factories/make-comprar-ingresso-controller';
import { makeValidarIngressoController } from './factories/make-validar-ingresso-controller';

export const router = express.Router();

// Middleware
router.use(cors());
router.use(express.json());

// Rotas de eventos
router.post('/eventos', async (req: Request, res: Response) => {
  const controller = makeCriarEventoController();
  return controller.handle(req, res);
});

router.get('/eventos', async (req: Request, res: Response) => {
  const controller = makeListarEventosController();
  return controller.handle(req, res);
});

// Rotas de compras
router.post('/compras', async (req: Request, res: Response) => {
  const controller = makeComprarIngressoController();
  return controller.handle(req, res);
});

// Rotas de validação
router.post('/validar-ingresso', async (req: Request, res: Response) => {
  const controller = makeValidarIngressoController();
  return controller.handle(req, res);
});

// Rota de saúde
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'API de Gestão de Ingressos funcionando',
    timestamp: new Date().toISOString()
  });
});
