import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rotas from './rotas';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middlewares para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api', rotas);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    mensagem: 'Sistema de Gestão de Ingressos de Eventos',
    versao: '1.0.0',
    status: 'Funcionando',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erro 404
app.use('*', (req, res) => {
  res.status(404).json({
    mensagem: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros globais
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);
  
  res.status(error.status || 500).json({
    mensagem: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`🔍 API Health: http://localhost:${PORT}/api/health`);
  });
}

export default app;