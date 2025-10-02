import { Request, Response } from "express";
import { ICompraController } from "../contracts/compra/IController";
import {
  ICriarCompraUsecase,
  IListarComprasUsecase,
  ICalcularTotalUsecase,
} from "../contracts/compra/IUsecase";
import { Compra } from "../domain/entities/Compra";

export class CompraController implements ICompraController {
  constructor(
    private criarCompraUsecase: ICriarCompraUsecase,
    private listarComprasUsecase: IListarComprasUsecase,
    private calcularTotalUsecase: ICalcularTotalUsecase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const {
        eventoId,
        tipoIngressoId,
        nome,
        email,
        matricula,
        quantidade,
        valorTotal,
      } = req.body;

      const compra = await this.criarCompraUsecase.execute({
        eventoId,
        tipoIngressoId,
        nome,
        email,
        matricula,
        quantidade,
        valorTotal,
      });

      res.status(201).json(compra);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const compras = await this.listarComprasUsecase.execute({});
      const compra = compras.find((c: Compra) => c.id === Number(id));

      if (!compra) {
        res.status(404).json({ error: "Compra não encontrada" });
        return;
      }

      res.status(200).json(compra);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const compras = await this.listarComprasUsecase.execute({});
      res.status(200).json(compras);
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

  async findByEvento(req: Request, res: Response): Promise<void> {
    try {
      const { eventoId } = req.params;
      const compras = await this.listarComprasUsecase.execute({
        eventoId: Number(eventoId),
      });

      res.status(200).json(compras);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async calculateTotal(req: Request, res: Response): Promise<void> {
    try {
      const { eventoId } = req.params;
      const totais = await this.calcularTotalUsecase.execute({
        eventoId: Number(eventoId),
      });

      res.status(200).json(totais);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
