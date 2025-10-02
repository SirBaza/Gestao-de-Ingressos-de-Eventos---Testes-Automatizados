import { Request, Response } from "express";
import { IEventoController } from "../contracts/evento/IController";
import {
  ICriarEventoUsecase,
  IListarEventosUsecase,
  IAtualizarCapacidadeUsecase,
  IVerificarDisponibilidadeUsecase,
} from "../contracts/evento/IUsecase";
import { Evento } from "../domain/entities/Evento";

export class EventoController implements IEventoController {
  constructor(
    private criarEventoUsecase: ICriarEventoUsecase,
    private listarEventosUsecase: IListarEventosUsecase,
    private atualizarCapacidadeUsecase: IAtualizarCapacidadeUsecase,
    private verificarDisponibilidadeUsecase: IVerificarDisponibilidadeUsecase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { nome, data, capacidadeTotal, local } = req.body;

      const evento = await this.criarEventoUsecase.execute({
        nome,
        data,
        capacidadeTotal,
        local,
      });

      res.status(201).json(evento);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventos = await this.listarEventosUsecase.execute({});
      const evento = eventos.find((e: Evento) => e.id === Number(id));

      if (!evento) {
        res.status(404).json({ error: "Evento não encontrado" });
        return;
      }

      res.status(200).json(evento);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const eventos = await this.listarEventosUsecase.execute({});
      res.status(200).json(eventos);
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

  async findByDate(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.params;
      const eventos = await this.listarEventosUsecase.execute({
        data: new Date(data),
      });

      res.status(200).json(eventos);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async findByLocal(req: Request, res: Response): Promise<void> {
    try {
      const { local } = req.params;
      const eventos = await this.listarEventosUsecase.execute({ local });

      res.status(200).json(eventos);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateCapacity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { novaCapacidade, ingressosVendidos } = req.body;

      const evento = await this.atualizarCapacidadeUsecase.execute({
        eventoId: Number(id),
        novaCapacidade,
        ingressosVendidos,
      });

      res.status(200).json(evento);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { quantidadeRequerida } = req.query;

      const disponibilidade =
        await this.verificarDisponibilidadeUsecase.execute({
          eventoId: Number(id),
          quantidadeRequerida: Number(quantidadeRequerida),
        });

      res.status(200).json(disponibilidade);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
