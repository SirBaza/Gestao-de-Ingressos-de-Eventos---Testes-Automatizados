import { Router } from "express";
import { factoryTipoIngresso } from "../../factories/factoryTipoIngresso";

export function tiposIngressoRoutes(): Router {
  const router = Router();

  const factory = factoryTipoIngresso();

  router.get("/", (req, res) => factory.findAll(req, res));
  router.get("/:id", (req, res) => factory.findById(req, res));
  router.post("/", (req, res) => factory.create(req, res));
  router.put("/:id", (req, res) => factory.update(req, res));
  router.delete("/:id", (req, res) => factory.delete(req, res));

  router.get("/evento/:eventoId", (req, res) => factory.findByEvento(req, res));
  router.get("/:id/disponibilidade", (req, res) =>
    factory.checkAvailability(req, res)
  );
  router.post("/:id/reduzir-estoque", (req, res) =>
    factory.reduceStock(req, res)
  );

  return router;
}
