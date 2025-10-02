import { Request, Response } from "express";
import { HashController } from "../../src/controllers/HashController";
import {
  IGerarHashUsecase,
  IValidarHashUsecase,
  IGerarHashUnicoUsecase,
} from "../../src/contracts/hash/IUsecase";

class GerarHashUseCaseFake implements IGerarHashUsecase {
  chamado: boolean = false;
  async execute(data: { payload: any }): Promise<string> {
    this.chamado = true;
    return "hash_gerado_123";
  }
}

class ValidarHashUseCaseFake implements IValidarHashUsecase {
  chamado: boolean = false;
  async execute(data: {
    payload: any;
    hashEsperado: string;
  }): Promise<boolean> {
    this.chamado = true;
    return data.hashEsperado === "hash_valido";
  }
}

class GerarHashUnicoUseCaseFake implements IGerarHashUnicoUsecase {
  chamado: boolean = false;
  async execute(data: { payload: any; timestamp?: number }): Promise<string> {
    this.chamado = true;
    return `hash_unico_${data.timestamp || Date.now()}`;
  }
}

class GerarHashUseCaseFakeComErro implements IGerarHashUsecase {
  chamado: boolean = false;
  async execute(data: { payload: any }): Promise<string> {
    this.chamado = true;
    throw new Error("Erro ao gerar hash");
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
  const gerarHashUseCase = new GerarHashUseCaseFake();
  const validarHashUseCase = new ValidarHashUseCaseFake();
  const gerarHashUnicoUseCase = new GerarHashUnicoUseCaseFake();
  const controller = new HashController(
    gerarHashUseCase,
    validarHashUseCase,
    gerarHashUnicoUseCase
  );
  const responseFake = new ResponseFake();

  return {
    gerarHashUseCase,
    validarHashUseCase,
    gerarHashUnicoUseCase,
    controller,
    responseFake,
  };
}

describe("HashController", () => {
  it("deve instanciar HashController", () => {
    const { controller } = makeSUT();
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("deve retornar 201 ao criar um hash com sucesso", async () => {
      const { controller, gerarHashUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          payload: { compraId: 1, userId: 123 },
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(gerarHashUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(201);
    });

    it("deve retornar erro 400 quando houver falha ao criar hash", async () => {
      const gerarHashUseCaseComErro = new GerarHashUseCaseFakeComErro();
      const validarHashUseCase = new ValidarHashUseCaseFake();
      const gerarHashUnicoUseCase = new GerarHashUnicoUseCaseFake();
      const controller = new HashController(
        gerarHashUseCaseComErro,
        validarHashUseCase,
        gerarHashUnicoUseCase
      );
      const responseFake = new ResponseFake();

      const requestStub = {
        body: {
          payload: { compraId: 1, userId: 123 },
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(gerarHashUseCaseComErro.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(400);
      expect(responseFake.jsonInformado.error).toBe("Erro ao gerar hash");
    });
  });

  describe("generate", () => {
    it("deve status 200 ao gerar um hash único com sucesso", async () => {
      const { controller, gerarHashUnicoUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          payload: { compraId: 1, userId: 123 },
          timestamp: 1234567890,
        },
      } as Request;

      await controller.generate(requestStub, responseFake as any as Response);

      expect(gerarHashUnicoUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(200);
    });
  });

  describe("validate", () => {
    it("deve status 200 ao validar um hash com sucesso", async () => {
      const { controller, validarHashUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          payload: { compraId: 1, userId: 123 },
          hashEsperado: "hash_valido",
        },
      } as Request;

      await controller.validate(requestStub, responseFake as any as Response);

      expect(validarHashUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(200);
    });

    it("deve retornar  status 200 quando hash é inválido", async () => {
      const { controller, validarHashUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          payload: { compraId: 1, userId: 123 },
          hashEsperado: "hash_invalido",
        },
      } as Request;

      await controller.validate(requestStub, responseFake as any as Response);

      expect(validarHashUseCase.chamado).toBe(true);
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
