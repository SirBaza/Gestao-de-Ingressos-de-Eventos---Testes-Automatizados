import { Router } from "express";
import { factoryCompra } from "../../factories/factoryCompra";

export function comprasRoutes(): Router {
  const router = Router();

  const factory = factoryCompra();

  router.get("/", (req, res) => factory.findAll(req, res));
  router.get("/:id", (req, res) => factory.findById(req, res));
  router.post("/", (req, res) => factory.create(req, res));
  router.put("/:id", (req, res) => factory.update(req, res));
  router.delete("/:id", (req, res) => factory.delete(req, res));

  router.get("/evento/:eventoId", (req, res) => factory.findByEvento(req, res));
  router.get("/evento/:eventoId/totais", (req, res) =>
    factory.calculateTotal(req, res)
  );

  return router;
}
