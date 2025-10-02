import { Request, Response } from "express";
import { IController } from "../IController";

/**
 * Interface específica para o controller de Ingresso
 * Estende IController e adiciona métodos específicos de ingressos
 */
export interface IIngressoController extends IController {
  findByHash(req: Request, res: Response): Promise<void>;
  findByCompra(req: Request, res: Response): Promise<void>;
  validate(req: Request, res: Response): Promise<void>;
  checkUsage(req: Request, res: Response): Promise<void>;
}
