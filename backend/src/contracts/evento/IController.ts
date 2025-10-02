import { Request, Response } from "express";
import { IController } from "../IController";

export interface IEventoController extends IController {
  updateCapacity(req: Request, res: Response): Promise<void>;
}
