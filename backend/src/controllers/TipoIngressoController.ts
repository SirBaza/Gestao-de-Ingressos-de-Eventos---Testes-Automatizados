import { Request, Response } from "express";
import { ITipoIngressoController } from "../contracts/tipoIngresso/IController";
import {
  ICriarTipoIngressoUsecase,
  IListarTiposIngressoPorEventoUsecase,
  IVerificarDisponibilidadeTipoIngressoUsecase,
  IReduzirEstoqueTipoIngressoUsecase,
} from "../contracts/tipoIngresso/IUsecase";
import { TipoIngresso } from "../domain/entities/TipoIngresso";

export class TipoIngressoController implements ITipoIngressoController {
  constructor(
    private criarTipoIngressoUsecase: ICriarTipoIngressoUsecase,
    private listarTiposIngressoPorEventoUsecase: IListarTiposIngressoPorEventoUsecase,
    private verificarDisponibilidadeTipoIngressoUsecase: IVerificarDisponibilidadeTipoIngressoUsecase,
    private reduzirEstoqueTipoIngressoUsecase: IReduzirEstoqueTipoIngressoUsecase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { eventoId, nome, preco, quantidadeInicial } = req.body;

      const tipoIngresso = await this.criarTipoIngressoUsecase.execute({
        eventoId,
        nome,
        preco,
        quantidadeInicial,
      });

      res.status(201).json(tipoIngresso);
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

  async findByEvento(req: Request, res: Response): Promise<void> {
    try {
      const { eventoId } = req.params;
      const tipos = await this.listarTiposIngressoPorEventoUsecase.execute({
        eventoId: Number(eventoId),
      });

      res.status(200).json(tipos);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantidade } = req.query;

      const resultado =
        await this.verificarDisponibilidadeTipoIngressoUsecase.execute({
          tipoIngressoId: Number(id),
          quantidade: Number(quantidade),
        });

      res.status(200).json(resultado);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async reduceStock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;

      const tipo = await this.reduzirEstoqueTipoIngressoUsecase.execute({
        tipoIngressoId: Number(id),
        quantidade,
      });

      res.status(200).json(tipo);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
