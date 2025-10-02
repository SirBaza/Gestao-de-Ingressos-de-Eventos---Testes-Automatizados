import { Request, Response } from "express";
import { TipoIngressoController } from "../../src/controllers/TipoIngressoController";
import {
  ICriarTipoIngressoUsecase,
  IListarTiposIngressoPorEventoUsecase,
  IVerificarDisponibilidadeTipoIngressoUsecase,
  IReduzirEstoqueTipoIngressoUsecase,
} from "../../src/contracts/tipoIngresso/IUsecase";
import { TipoIngresso } from "../../src/domain/entities/TipoIngresso";

class CriarTipoIngressoUseCaseFake implements ICriarTipoIngressoUsecase {
  chamado: boolean = false;
  async execute(
    data: Omit<TipoIngresso, "id" | "criadoEm" | "quantidadeDisponivel">
  ): Promise<TipoIngresso> {
    this.chamado = true;
    return new TipoIngresso(
      data.eventoId,
      data.nome,
      data.preco,
      data.quantidadeInicial,
      data.quantidadeInicial,
      1,
      new Date()
    );
  }
}

class ListarTiposIngressoPorEventoUseCaseFake
  implements IListarTiposIngressoPorEventoUsecase
{
  chamado: boolean = false;
  tiposMock: TipoIngresso[] = [
    new TipoIngresso(1, "VIP", 200, 100, 100, 1, new Date()),
    new TipoIngresso(1, "Pista", 50, 500, 500, 2, new Date()),
  ];

  async execute(data: { eventoId: number }): Promise<TipoIngresso[]> {
    this.chamado = true;
    return this.tiposMock.filter((t) => t.eventoId === data.eventoId);
  }
}

class VerificarDisponibilidadeTipoIngressoUseCaseFake
  implements IVerificarDisponibilidadeTipoIngressoUsecase
{
  chamado: boolean = false;
  async execute(data: {
    tipoIngressoId: number;
    quantidade: number;
  }): Promise<{ disponivel: boolean; quantidadeDisponivel: number }> {
    this.chamado = true;
    return {
      disponivel: true,
      quantidadeDisponivel: 50,
    };
  }
}

class ReduzirEstoqueTipoIngressoUseCaseFake
  implements IReduzirEstoqueTipoIngressoUsecase
{
  chamado: boolean = false;
  async execute(data: {
    tipoIngressoId: number;
    quantidade: number;
  }): Promise<TipoIngresso> {
    this.chamado = true;
    return new TipoIngresso(
      1,
      "VIP",
      200,
      100 - data.quantidade,
      100,
      data.tipoIngressoId,
      new Date()
    );
  }
}

class CriarTipoIngressoUseCaseFakeComErro implements ICriarTipoIngressoUsecase {
  chamado: boolean = false;
  async execute(
    data: Omit<TipoIngresso, "id" | "criadoEm" | "quantidadeDisponivel">
  ): Promise<TipoIngresso> {
    this.chamado = true;
    throw new Error("Erro ao criar tipo de ingresso");
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
  const criarTipoIngressoUseCase = new CriarTipoIngressoUseCaseFake();
  const listarTiposIngressoPorEventoUseCase =
    new ListarTiposIngressoPorEventoUseCaseFake();
  const verificarDisponibilidadeTipoIngressoUseCase =
    new VerificarDisponibilidadeTipoIngressoUseCaseFake();
  const reduzirEstoqueTipoIngressoUseCase =
    new ReduzirEstoqueTipoIngressoUseCaseFake();
  const controller = new TipoIngressoController(
    criarTipoIngressoUseCase,
    listarTiposIngressoPorEventoUseCase,
    verificarDisponibilidadeTipoIngressoUseCase,
    reduzirEstoqueTipoIngressoUseCase
  );
  const responseFake = new ResponseFake();

  return {
    criarTipoIngressoUseCase,
    listarTiposIngressoPorEventoUseCase,
    verificarDisponibilidadeTipoIngressoUseCase,
    reduzirEstoqueTipoIngressoUseCase,
    controller,
    responseFake,
  };
}

describe("TipoIngressoController", () => {
  it("deve instanciar TipoIngressoController", () => {
    const { controller } = makeSUT();
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("deve retornar 201 ao criar um tipo de ingresso com sucesso", async () => {
      const { controller, criarTipoIngressoUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          eventoId: 1,
          nome: "VIP",
          preco: 200,
          quantidadeInicial: 100,
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarTipoIngressoUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(201);
    });

    it("deve retornar erro 400 quando houver falha ao criar tipo de ingresso", async () => {
      const criarTipoIngressoUseCaseComErro =
        new CriarTipoIngressoUseCaseFakeComErro();
      const listarTiposIngressoPorEventoUseCase =
        new ListarTiposIngressoPorEventoUseCaseFake();
      const verificarDisponibilidadeTipoIngressoUseCase =
        new VerificarDisponibilidadeTipoIngressoUseCaseFake();
      const reduzirEstoqueTipoIngressoUseCase =
        new ReduzirEstoqueTipoIngressoUseCaseFake();
      const controller = new TipoIngressoController(
        criarTipoIngressoUseCaseComErro,
        listarTiposIngressoPorEventoUseCase,
        verificarDisponibilidadeTipoIngressoUseCase,
        reduzirEstoqueTipoIngressoUseCase
      );
      const responseFake = new ResponseFake();

      const requestStub = {
        body: {
          eventoId: 1,
          nome: "VIP",
          preco: 200,
          quantidadeInicial: 100,
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarTipoIngressoUseCaseComErro.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(400);
      expect(responseFake.jsonInformado.error).toBe(
        "Erro ao criar tipo de ingresso"
      );
    });
  });

  describe("findAll", () => {
    it("deve retornar 501 para método não implementado", async () => {
      const { controller, responseFake } = makeSUT();

      const requestStub = {} as Request;

      await controller.findAll(requestStub, responseFake as any as Response);

      expect(responseFake.statusCodeInformado).toBe(501);
      expect(responseFake.jsonInformado.error).toBe("Método não implementado");
    });
  });

  describe("findById", () => {
    it("deve retornar 501 para método não implementado", async () => {
      const { controller, responseFake } = makeSUT();

      const requestStub = {
        params: { id: "1" },
      } as any as Request;

      await controller.findById(requestStub, responseFake as any as Response);

      expect(responseFake.statusCodeInformado).toBe(501);
      expect(responseFake.jsonInformado.error).toBe("Método não implementado");
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
