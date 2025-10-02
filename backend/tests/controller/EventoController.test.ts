import { Request, Response } from "express";
import { EventoController } from "../../src/controllers/EventoController";
import {
  ICriarEventoUsecase,
  IListarEventosUsecase,
  IAtualizarCapacidadeUsecase,
  IVerificarDisponibilidadeUsecase,
} from "../../src/contracts/evento/IUsecase";
import { Evento } from "../../src/domain/entities/Evento";

class CriarEventoUseCaseFake implements ICriarEventoUsecase {
  chamado: boolean = false;
  async execute(data: Omit<Evento, "id" | "criadoEm">): Promise<Evento> {
    this.chamado = true;
    return new Evento(
      data.nome,
      data.data,
      data.capacidadeTotal,
      data.local,
      1,
      new Date()
    );
  }
}

class ListarEventosUseCaseFake implements IListarEventosUsecase {
  chamado: boolean = false;
  eventosMock: Evento[] = [
    new Evento(
      "Show Rock",
      new Date("2025-12-01"),
      1000,
      "Arena",
      1,
      new Date()
    ),
    new Evento(
      "Festival",
      new Date("2025-12-15"),
      5000,
      "Parque",
      2,
      new Date()
    ),
  ];

  async execute(filtros: { data?: Date; local?: string }): Promise<Evento[]> {
    this.chamado = true;
    let resultado = this.eventosMock;

    if (filtros.data) {
      resultado = resultado.filter((e) => e.data === filtros.data);
    }

    if (filtros.local) {
      resultado = resultado.filter((e) => e.local === filtros.local);
    }

    return resultado;
  }
}

class AtualizarCapacidadeUseCaseFake implements IAtualizarCapacidadeUsecase {
  chamado: boolean = false;
  async execute(data: {
    eventoId: number;
    novaCapacidade: number;
    ingressosVendidos: number;
  }): Promise<Evento> {
    this.chamado = true;
    return new Evento(
      "Show Rock",
      new Date("2025-12-01"),
      data.novaCapacidade,
      "Arena",
      data.eventoId,
      new Date()
    );
  }
}

class VerificarDisponibilidadeUseCaseFake
  implements IVerificarDisponibilidadeUsecase
{
  chamado: boolean = false;
  async execute(data: {
    eventoId: number;
    quantidadeRequerida: number;
  }): Promise<{ disponivel: boolean; capacidadeRestante: number }> {
    this.chamado = true;
    return {
      disponivel: true,
      capacidadeRestante: 500,
    };
  }
}

class CriarEventoUseCaseFakeComErro implements ICriarEventoUsecase {
  chamado: boolean = false;
  async execute(data: Omit<Evento, "id" | "criadoEm">): Promise<Evento> {
    this.chamado = true;
    throw new Error("Erro ao criar evento");
  }
}

class ResponseFake {
  statusCodeInformado: number = 0;
  jsonInformado: any = null;

  status(code: number): ResponseFake {
    this.statusCodeInformado = code;
    return this;
  }

  json(data: any): ResponseFake {
    this.jsonInformado = data;
    return this;
  }
}

function makeSUT() {
  const criarEventoUseCase = new CriarEventoUseCaseFake();
  const listarEventosUseCase = new ListarEventosUseCaseFake();
  const atualizarCapacidadeUseCase = new AtualizarCapacidadeUseCaseFake();
  const verificarDisponibilidadeUseCase =
    new VerificarDisponibilidadeUseCaseFake();
  const controller = new EventoController(
    criarEventoUseCase,
    listarEventosUseCase,
    atualizarCapacidadeUseCase,
    verificarDisponibilidadeUseCase
  );
  const responseFake = new ResponseFake();

  return {
    criarEventoUseCase,
    listarEventosUseCase,
    atualizarCapacidadeUseCase,
    verificarDisponibilidadeUseCase,
    controller,
    responseFake,
  };
}

describe("EventoController", () => {
  it("deve instanciar EventoController", () => {
    const { controller } = makeSUT();
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("deve retornar 201 ao criar um evento com sucesso", async () => {
      const { controller, criarEventoUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          nome: "Show Rock",
          data: new Date("2025-12-01"),
          capacidadeTotal: 1000,
          local: "Arena",
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarEventoUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(201);
    });

    it("deve retornar erro 400 quando houver falha ao criar evento", async () => {
      const criarEventoUseCaseComErro = new CriarEventoUseCaseFakeComErro();
      const listarEventosUseCase = new ListarEventosUseCaseFake();
      const atualizarCapacidadeUseCase = new AtualizarCapacidadeUseCaseFake();
      const verificarDisponibilidadeUseCase =
        new VerificarDisponibilidadeUseCaseFake();
      const controller = new EventoController(
        criarEventoUseCaseComErro,
        listarEventosUseCase,
        atualizarCapacidadeUseCase,
        verificarDisponibilidadeUseCase
      );
      const responseFake = new ResponseFake();

      const requestStub = {
        body: {
          nome: "Show Rock",
          data: new Date("2025-12-01"),
          capacidadeTotal: 1000,
          local: "Arena",
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarEventoUseCaseComErro.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(400);
      expect(responseFake.jsonInformado.error).toBe("Erro ao criar evento");
    });
  });

  describe("findAll", () => {
    it("deve retornar 200 ao listar todos os eventos", async () => {
      const { controller, listarEventosUseCase, responseFake } = makeSUT();

      const requestStub = {} as Request;

      await controller.findAll(requestStub, responseFake as any as Response);

      expect(listarEventosUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(200);
    });
  });

  describe("findById", () => {
    it("deve retornar 404 quando evento não for encontrado", async () => {
      const { controller, listarEventosUseCase, responseFake } = makeSUT();

      const requestStub = {
        params: { id: "999" },
      } as any as Request;

      await controller.findById(requestStub, responseFake as any as Response);

      expect(listarEventosUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(404);
      expect(responseFake.jsonInformado.error).toBe("Evento não encontrado");
    });
  });

  describe("update", () => {
    it("deve retornar 501 para método não implementado", async () => {
      const { controller, responseFake } = makeSUT();

      const requestStub = {
        params: { id: "1" },
        body: {},
      } as any as Request;

      await controller.update(requestStub, responseFake as any as Response);

      expect(responseFake.statusCodeInformado).toBe(501);
      expect(responseFake.jsonInformado.error).toBe("Método não implementado");
    });
  });

  describe("delete", () => {
    it("deve retornar 501 para método não implementado", async () => {
      const { controller, responseFake } = makeSUT();

      const requestStub = {
        params: { id: "1" },
      } as any as Request;

      await controller.delete(requestStub, responseFake as any as Response);

      expect(responseFake.statusCodeInformado).toBe(501);
      expect(responseFake.jsonInformado.error).toBe("Método não implementado");
    });
  });
});
