import { Request, Response } from "express";
import { IController } from "../IController";

export interface ITipoIngressoController extends IController {
  findByEvento(req: Request, res: Response): Promise<void>;
  checkAvailability(req: Request, res: Response): Promise<void>;
  reduceStock(req: Request, res: Response): Promise<void>;
}
