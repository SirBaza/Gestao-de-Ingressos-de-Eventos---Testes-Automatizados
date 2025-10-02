import { Router } from "express";
import { factoryEvento } from "../../factories/factoryEvento";

export function eventosRoutes(): Router {
  const router = Router();

  const factory = factoryEvento();

  router.get("/", (req, res) => factory.findAll(req, res));
  router.get("/:id", (req, res) => factory.findById(req, res));
  router.post("/", (req, res) => factory.create(req, res));
  router.put("/:id", (req, res) => factory.update(req, res));
  router.delete("/:id", (req, res) => factory.delete(req, res));

  router.get("/data/:data", (req, res) => factory.findByDate(req, res));
  router.get("/local/:local", (req, res) => factory.findByLocal(req, res));
  router.put("/:id/capacidade", (req, res) => factory.updateCapacity(req, res));
  router.get("/:id/disponibilidade", (req, res) =>
    factory.checkAvailability(req, res)
  );

  return router;
}
