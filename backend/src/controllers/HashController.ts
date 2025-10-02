import { Request, Response } from "express";
import { IHashController } from "../contracts/hash/IController";
import {
  IGerarHashUsecase,
  IValidarHashUsecase,
  IGerarHashUnicoUsecase,
} from "../contracts/hash/IUsecase";

export class HashController implements IHashController {
  constructor(
    private gerarHashUsecase: IGerarHashUsecase,
    private validarHashUsecase: IValidarHashUsecase,
    private gerarHashUnicoUsecase: IGerarHashUnicoUsecase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { payload } = req.body;

      const hash = await this.gerarHashUsecase.execute({ payload });

      res.status(201).json({ hash });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({ error: "Método não implementado" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({ error: "Método não implementado" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({ error: "Método não implementado" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({ error: "Método não implementado" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { payload, timestamp } = req.body;

      const hash = await this.gerarHashUnicoUsecase.execute({
        payload,
        timestamp,
      });

      res.status(200).json({ hash });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async validate(req: Request, res: Response): Promise<void> {
    try {
      const { payload, hashEsperado } = req.body;

      const valido = await this.validarHashUsecase.execute({
        payload,
        hashEsperado,
      });

      res.status(200).json({ valido });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
