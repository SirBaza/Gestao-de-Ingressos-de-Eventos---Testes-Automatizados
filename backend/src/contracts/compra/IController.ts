import { Request, Response } from "express";
import { IController } from "../IController";

export interface ICompraController extends IController {
  findByEvento(req: Request, res: Response): Promise<void>;
  calculateTotal(req: Request, res: Response): Promise<void>;
}
