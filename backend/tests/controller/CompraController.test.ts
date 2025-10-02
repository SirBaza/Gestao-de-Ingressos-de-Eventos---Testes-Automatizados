import { Request, Response } from "express";
import { CompraController } from "../../src/controllers/CompraController";
import {
  ICriarCompraUsecase,
  IListarComprasUsecase,
  ICalcularTotalUsecase,
} from "../../src/contracts/compra/IUsecase";
import { Compra } from "../../src/domain/entities/Compra";

class CriarCompraUseCaseFake implements ICriarCompraUsecase {
  chamado: boolean = false;
  async execute(data: Omit<Compra, "id" | "criadoEm">): Promise<Compra> {
    this.chamado = true;
    return new Compra(
      data.eventoId,
      data.tipoIngressoId,
      data.nome,
      data.email,
      data.matricula,
      data.quantidade,
      data.valorTotal,
      1,
      new Date()
    );
  }
}

class ListarComprasUseCaseFake implements IListarComprasUsecase {
  chamado: boolean = false;
  comprasMock: Compra[] = [
    new Compra(1, 1, "João", "joao@test.com", "123", 2, 100, 1, new Date()),
    new Compra(1, 1, "Maria", "maria@test.com", "456", 1, 50, 2, new Date()),
  ];

  async execute(filtros: {
    eventoId?: number;
    email?: string;
  }): Promise<Compra[]> {
    this.chamado = true;
    let resultado = this.comprasMock;

    if (filtros.eventoId) {
      resultado = resultado.filter((c) => c.eventoId === filtros.eventoId);
    }

    if (filtros.email) {
      resultado = resultado.filter((c) => c.email === filtros.email);
    }

    return resultado;
  }
}

class CalcularTotalUseCaseFake implements ICalcularTotalUsecase {
  chamado: boolean = false;
  async execute(data: { eventoId: number }): Promise<{
    totalIngressos: number;
    receita: number;
  }> {
    this.chamado = true;
    return {
      totalIngressos: 10,
      receita: 500,
    };
  }
}

class CriarCompraUseCaseFakeComErro implements ICriarCompraUsecase {
  chamado: boolean = false;
  async execute(data: Omit<Compra, "id" | "criadoEm">): Promise<Compra> {
    this.chamado = true;
    throw new Error("Erro ao criar compra");
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
  const criarCompraUseCase = new CriarCompraUseCaseFake();
  const listarComprasUseCase = new ListarComprasUseCaseFake();
  const calcularTotalUseCase = new CalcularTotalUseCaseFake();
  const controller = new CompraController(
    criarCompraUseCase,
    listarComprasUseCase,
    calcularTotalUseCase
  );
  const responseFake = new ResponseFake();

  return {
    criarCompraUseCase,
    listarComprasUseCase,
    calcularTotalUseCase,
    controller,
    responseFake,
  };
}

describe("CompraController", () => {
  it("deve instanciar CompraController", () => {
    const { controller } = makeSUT();
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("deve retornar 201 ao criar uma compra com sucesso", async () => {
      const { controller, criarCompraUseCase, responseFake } = makeSUT();

      const requestStub = {
        body: {
          eventoId: 1,
          tipoIngressoId: 1,
          nome: "João Silva",
          email: "joao@test.com",
          matricula: "123456",
          quantidade: 2,
          valorTotal: 100,
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarCompraUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(201);
    });

    it("deve retornar erro 400 quando houver falha ao criar compra", async () => {
      const criarCompraUseCaseComErro = new CriarCompraUseCaseFakeComErro();
      const listarComprasUseCase = new ListarComprasUseCaseFake();
      const calcularTotalUseCase = new CalcularTotalUseCaseFake();
      const controller = new CompraController(
        criarCompraUseCaseComErro,
        listarComprasUseCase,
        calcularTotalUseCase
      );
      const responseFake = new ResponseFake();

      const requestStub = {
        body: {
          eventoId: 1,
          tipoIngressoId: 1,
          nome: "João Silva",
          email: "joao@test.com",
          matricula: "123456",
          quantidade: 2,
          valorTotal: 100,
        },
      } as Request;

      await controller.create(requestStub, responseFake as any as Response);

      expect(criarCompraUseCaseComErro.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(400);
      expect(responseFake.jsonInformado.error).toBe("Erro ao criar compra");
    });
  });

  describe("findById", () => {
    it("deve retornar 404 quando compra não for encontrada", async () => {
      const { controller, listarComprasUseCase, responseFake } = makeSUT();

      const requestStub = {
        params: { id: "999" },
      } as any as Request;

      await controller.findById(requestStub, responseFake as any as Response);

      expect(listarComprasUseCase.chamado).toBe(true);
      expect(responseFake.statusCodeInformado).toBe(404);
      expect(responseFake.jsonInformado.error).toBe("Compra não encontrada");
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
