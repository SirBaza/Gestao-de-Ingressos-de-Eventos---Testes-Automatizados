import { Router } from "express";
import { factoryIngresso } from "../../factories/factoryIngresso";

export function ingressosRoutes(): Router {
  const router = Router();

  const factory = factoryIngresso();

  router.get("/", (req, res) => factory.findAll(req, res));
  router.get("/:id", (req, res) => factory.findById(req, res));
  router.post("/", (req, res) => factory.create(req, res));
  router.put("/:id", (req, res) => factory.update(req, res));
  router.delete("/:id", (req, res) => factory.delete(req, res));

  router.get("/compra/:compraId", (req, res) => factory.findByCompra(req, res));
  router.get("/hash/:hash", (req, res) => factory.findByHash(req, res));
  router.post("/validar", (req, res) => factory.validate(req, res));
  router.get("/:hash/uso", (req, res) => factory.checkUsage(req, res));

  return router;
}
