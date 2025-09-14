import { Router } from 'express';
import { ControladorAutenticacao } from '../controladores/ControladorAutenticacao';
import { middlewareAutenticacao } from '../middlewares/autenticacao';

const router = Router();

// Rotas públicas
router.post('/registrar', ControladorAutenticacao.registrar);
router.post('/login', ControladorAutenticacao.login);

// Rotas protegidas
router.get('/perfil', middlewareAutenticacao, ControladorAutenticacao.perfil);

export default router;
