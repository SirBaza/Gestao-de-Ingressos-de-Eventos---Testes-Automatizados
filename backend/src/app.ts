import express from 'express';
import cors from 'cors';
import { DatabaseConnection } from './infra/database/connection';
import { router } from './main/router';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', router);

// Inicializar banco de dados e servidor
async function iniciarServidor() {
  try {
    console.log('Inicializando banco de dados...');
    await DatabaseConnection.initializeDatabase();
    console.log('Banco de dados inicializado com sucesso!');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`API disponível em: http://localhost:${PORT}/api`);
      console.log(`Documentação disponível em: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, fechando servidor...');
  DatabaseConnection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, fechando servidor...');
  DatabaseConnection.close();
  process.exit(0);
});

iniciarServidor();
