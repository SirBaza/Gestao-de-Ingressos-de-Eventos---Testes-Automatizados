import { Request, Response } from "express";
import { IIngressoController } from "../contracts/ingresso/IController";
import {
  ICriarIngressoUsecase,
  IListarIngressosPorCompraUsecase,
  IValidarIngressoUsecase,
  IVerificarUsoIngressoUsecase,
} from "../contracts/ingresso/IUsecase";
import { Ingresso } from "../domain/entities/Ingresso";

export class IngressoController implements IIngressoController {
  constructor(
    private criarIngressoUsecase: ICriarIngressoUsecase,
    private listarIngressosPorCompraUsecase: IListarIngressosPorCompraUsecase,
    private validarIngressoUsecase: IValidarIngressoUsecase,
    private verificarUsoIngressoUsecase: IVerificarUsoIngressoUsecase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { compraId, payload } = req.body;

      const ingresso = await this.criarIngressoUsecase.execute({
        compraId,
        payload,
      });

      res.status(201).json(ingresso);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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

  async findByCompra(req: Request, res: Response): Promise<void> {
    try {
      const { compraId } = req.params;
      const ingressos = await this.listarIngressosPorCompraUsecase.execute({
        compraId: Number(compraId),
      });

      res.status(200).json(ingressos);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findByHash(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.params;
      res.status(501).json({ error: "Método não implementado" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async validate(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.body;

      const resultado = await this.validarIngressoUsecase.execute({ hash });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async checkUsage(req: Request, res: Response): Promise<void> {
    try {
      const { hash } = req.params;

      const resultado = await this.verificarUsoIngressoUsecase.execute({
        hash,
      });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
