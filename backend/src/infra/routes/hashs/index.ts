import { Router } from "express";
import { factoryHash } from "../../factories/factoryHash";

export function hashsRoutes(): Router {
  const router = Router();

  const factory = factoryHash();

  router.get("/", (req, res) => factory.findAll(req, res));
  router.get("/:id", (req, res) => factory.findById(req, res));
  router.post("/", (req, res) => factory.create(req, res));
  router.put("/:id", (req, res) => factory.update(req, res));
  router.delete("/:id", (req, res) => factory.delete(req, res));

  router.post("/gerar", (req, res) => factory.generate(req, res));
  router.post("/validar", (req, res) => factory.validate(req, res));

  return router;
}
