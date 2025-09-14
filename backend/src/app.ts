import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de Gestão de Ingressos de Eventos');
});

app.listen(3001, () => {
  console.log('Servidor backend rodando na porta 3001');
});
