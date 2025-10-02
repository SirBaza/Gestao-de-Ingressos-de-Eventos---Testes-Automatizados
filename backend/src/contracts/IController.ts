import { Request, Response } from "express";

/**
 * Interface genérica para controllers
 * Define operações CRUD básicas que podem ser implementadas por qualquer controller
 */
export interface IController {
  create(req: Request, res: Response): Promise<void>;
  findById(req: Request, res: Response): Promise<void>;
  findAll(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}
