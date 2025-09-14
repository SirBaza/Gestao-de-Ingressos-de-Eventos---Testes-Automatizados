import { Router } from 'express';
import { ControladorIngressos } from '../controladores/ControladorIngressos';
import { middlewareAutenticacao, middlewareOrganizador } from '../middlewares/autenticacao';

const router = Router();

// Rotas públicas
router.post('/comprar', ControladorIngressos.comprarIngresso);
router.post('/validar', ControladorIngressos.validarIngresso);
router.get('/comprador/:email', ControladorIngressos.listarIngressosComprador);
router.get('/:id', ControladorIngressos.buscarIngresso);

// Rotas protegidas para organizadores
router.get('/evento/:eventoId/estatisticas', 
  middlewareAutenticacao, 
  middlewareOrganizador, 
  ControladorIngressos.estatisticasEvento
);

export default router;
