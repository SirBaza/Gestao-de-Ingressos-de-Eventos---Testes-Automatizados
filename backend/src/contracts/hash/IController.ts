import { Request, Response } from "express";
import { IController } from "../IController";

export interface IHashController extends IController {
  generate(req: Request, res: Response): Promise<void>;
  validate(req: Request, res: Response): Promise<void>;
}
