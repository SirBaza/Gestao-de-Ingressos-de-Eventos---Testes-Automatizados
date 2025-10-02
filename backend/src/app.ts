import express from "express";
import {
  comprasRoutes,
  eventosRoutes,
  ingressosRoutes,
  tiposIngressoRoutes,
  hashsRoutes,
} from "./infra/routes";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Gestão de Ingressos de Eventos");
});

app.use("/compras", comprasRoutes());
app.use("/eventos", eventosRoutes());
app.use("/ingressos", ingressosRoutes());
app.use("/tipos-ingresso", tiposIngressoRoutes());
app.use("/hashs", hashsRoutes());

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});

export default app;
