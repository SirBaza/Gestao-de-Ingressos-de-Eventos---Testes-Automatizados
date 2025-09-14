import { Router } from 'express';
import rotasAutenticacao from './autenticacao';
import rotasEventos from './eventos';
import rotasIngressos from './ingressos';

const router = Router();

// Registrar todas as rotas
router.use('/auth', rotasAutenticacao);
router.use('/eventos', rotasEventos);
router.use('/ingressos', rotasIngressos);

// Rota de saúde
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Sistema de Gestão de Ingressos'
  });
});

export default router;
