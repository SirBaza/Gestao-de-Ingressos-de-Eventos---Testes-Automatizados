import express from "express";
import { ApiController } from "./controllers/ApiController";

const app = express();
app.use(express.json());

const apiController = new ApiController();

app.get("/", (req, res) => {
  res.send("API de Gestão de Ingressos de Eventos");
});

// Rotas de eventos
app.get("/events", (req, res) => {
  try {
    const eventos = apiController.getAllEvents();
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/events", (req, res) => {
  try {
    const evento = apiController.createEvent(req.body);
    res.status(201).json(evento);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Rotas de tipos de ingresso
app.post("/events/:id/tickets", (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const tipoIngresso = apiController.createTicketType(eventId, req.body);
    res.status(201).json(tipoIngresso);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Evento não encontrado" ? 404 : 400;
    res.status(status).json({ error: message });
  }
});

// Rotas de compras
app.post("/purchases", (req, res) => {
  try {
    const resultado = apiController.createPurchase(req.body);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
});

// Rota de validação
app.post("/validate", (req, res) => {
  try {
    const { hash, payload } = req.body;
    const resultado = apiController.validateTicket(hash, payload);
    res.json(resultado);
  } catch (error: any) {
    const status = error.status || 400;
    res.status(status).json({ error: error.message });
  }
});

if (process.env.NODE_ENV === "test") {
  app.post("/test/reset", (req, res) => {
    apiController.reset();
    res.json({ message: "Estado resetado com sucesso" });
  });
}

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Servidor backend rodando na porta ${port}`);
  });
}

export default app;
