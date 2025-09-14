import { Router } from 'express';
import { ControladorEventos } from '../controladores/ControladorEventos';
import { middlewareAutenticacao, middlewareOrganizador } from '../middlewares/autenticacao';

const router = Router();

// Rotas públicas
router.get('/', ControladorEventos.listarEventos);
router.get('/:id', ControladorEventos.buscarEvento);

// Rotas protegidas para organizadores
router.post('/', middlewareAutenticacao, middlewareOrganizador, ControladorEventos.criarEvento);
router.get('/organizador/meus', middlewareAutenticacao, middlewareOrganizador, ControladorEventos.listarEventosOrganizador);
router.put('/:id', middlewareAutenticacao, middlewareOrganizador, ControladorEventos.atualizarEvento);
router.delete('/:id', middlewareAutenticacao, middlewareOrganizador, ControladorEventos.removerEvento);

export default router;
