import { Request, Response } from "express";
import { IngressoController } from "../../src/controllers/IngressoController";
import {
  ICriarIngressoUsecase,
  IListarIngressosPorCompraUsecase,
  IValidarIngressoUsecase,
  IVerificarUsoIngressoUsecase,
} from "../../src/contracts/ingresso/IUsecase";
import { Ingresso } from "../../src/domain/entities/Ingresso";

class CriarIngressoUseCaseFake implements ICriarIngressoUsecase {
  chamado: boolean = false;
  async execute(data: { compraId: number; payload: any }): Promise<Ingresso> {
    this.chamado = true;
    return new Ingresso(
      data.compraId,
      "hash123",
      false,
      1,
      undefined,
      new Date()
    );
  }
}

class ListarIngressosPorCompraUseCaseFake
  implements IListarIngressosPorCompraUsecase
{
  chamado: boolean = false;
  ingressosMock: Ingresso[] = [
    new Ingresso(1, "hash123", false, 1, undefined, new Date()),
    new Ingresso(1, "hash456", true, 2, new Date(), new Date()),
  ];

  async execute(data: { compraId: number }): Promise<Ingresso[]> {
    this.chamado = true;
    return this.ingressosMock.filter((i) => i.compraId === data.compraId);
  }
}

class ValidarIngressoUseCaseFake implements IValidarIngressoUsecase {
  chamado: boolean = false;
  async execute(data: { hash: string }): Promise<{
    valido: boolean;
    mensagem: string;
    ingresso?: Ingresso;
  }> {
    this.chamado = true;
    return {
      valido: true,
      mensagem: "Ingresso válido",
      ingresso: new Ingresso(1, data.hash, false, 1, undefined, new Date()),
    };
  }
}

class VerificarUsoIngressoUseCaseFake implements IVerificarUsoIngressoUsecase {
  chamado: boolean = false;
  async execute(data: {
    hash: string;
  }): Promise<{ usado: boolean; dataUso?: Date }> {
    this.chamado = true;
    return {
      usado: false,
      dataUso: undefined,
    };
  }
}

class CriarIngressoUseCaseFakeComErro implements ICriarIngressoUsecase {
  chamado: boolean = false;
  async execute(data: { compraId: number; payload: any }): Promise<Ingresso> {
    this.chamado = true;
    throw new Error("Erro ao criar ingresso");
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
  const criarIngressoUseCase = new CriarIngressoUseCaseFake();
  const listarIngressosPorCompraUseCase =
    new ListarIngressosPorCompraUseCaseFake();
  const validarIngressoUseCase = new ValidarIngressoUseCaseFake();
  const verificarUsoIngressoUseCase = new VerificarUsoIngressoUseCaseFake();
  const controller = new IngressoController(
    criarIngressoUseCase,
    listarIngressosPorCompraUseCase,
    validarIngressoUseCase,
    verificarUsoIngressoUseCase
  );
  const responseFake = new ResponseFake();

  return {
    criarIngressoUseCase,
    listarIngressosPorCompraUseCase,
    validarIngressoUseCase,
    verificarUsoIngressoUseCase,
    controller,
    responseFake,
  };
}

describe("IngressoController", () => {
  it("deve instanciar IngressoController", () => {
    const { controller } = makeSUT();
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("deve retornar 201 ao criar um ingresso com sucesso", async () => {
      const { controller, criarIngressoUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          compraId: 1,
          payload: { info: "test" },
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarIngressoUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(201);
    });

    it("deve retornar erro 400 quando houver falha ao criar ingresso", async () => {
      const criarIngressoUseCaseComErro = new CriarIngressoUseCaseFakeComErro();
      const listarIngressosPorCompraUseCase =
        new ListarIngressosPorCompraUseCaseFake();
      const validarIngressoUseCase = new ValidarIngressoUseCaseFake();
      const verificarUsoIngressoUseCase = new VerificarUsoIngressoUseCaseFake();
      const controller = new IngressoController(
        criarIngressoUseCaseComErro,
        listarIngressosPorCompraUseCase,
        validarIngressoUseCase,
        verificarUsoIngressoUseCase
      );
      const responseFake = new ResponseFake();

      const requestStub = {
        body: {
          compraId: 1,
          payload: { info: "test" },
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarIngressoUseCaseComErro.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(400);
      expect(responseFake.jsonInformado.error).toBe("Erro ao criar ingresso");
    });
  });

  describe("findByCompra", () => {
    it("deve retornar 200 ao listar ingressos por compra", async () => {
      const { controller, listarIngressosPorCompraUseCase, responseFake } =
        makeSUT();

      const requestStub = {
        params: { compraId: "1" },
      } as any as Request;

      await controller.findByCompra(
        requestStub,
        responseFake as any as Response
      );

      expect(listarIngressosPorCompraUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(200);
    });
  });

  describe("validate", () => {
    it("deve retornar 200 ao validar um ingresso", async () => {
      const { controller, validarIngressoUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: { hash: "hash123" },
      } as Request;

      await controller.validate(requestStub, responseFake as any as Response);

      expect(validarIngressoUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(200);
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

  describe("findByHash", () => {
    it("deve retornar 501 para método não implementado", async () => {
      const { controller, responseFake } = makeSUT();

      const requestStub = {
        params: { hash: "hash123" },
      } as any as Request;

      await controller.findByHash(requestStub, responseFake as any as Response);

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
