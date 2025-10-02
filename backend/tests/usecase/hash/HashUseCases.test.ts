import { GerarHashUseCase } from "../../../src/domain/usecase/hash/GerarHashUseCase";
import { ValidarHashUseCase } from "../../../src/domain/usecase/hash/ValidarHashUseCase";
import { GerarHashUnicoUseCase } from "../../../src/domain/usecase/hash/GerarHashUnicoUseCase";
import { IHashRepository } from "../../../src/contracts/hash/IRepository";

class FakeHashRepository implements IHashRepository {
  async generateHash(payload: any): Promise<string> {
    return `hash_${JSON.stringify(payload)}`;
  }

  async validateHash(payload: any, expectedHash: string): Promise<boolean> {
    const generatedHash = await this.generateHash(payload);
    return generatedHash === expectedHash;
  }

  async generateUniqueHash(payload: any): Promise<string> {
    return `unique_hash_${Date.now()}_${Math.random()}`;
  }
}

describe("GerarHashUseCase", () => {
  test("deve ser capaz de instanciar o use case", () => {
    const repository = new FakeHashRepository();
    const useCase = new GerarHashUseCase(repository);
    expect(useCase).toBeInstanceOf(GerarHashUseCase);
  });

  test("deve gerar um hash a partir de um payload", async () => {
    const repository = new FakeHashRepository();
    const useCase = new GerarHashUseCase(repository);

    const resultado = await useCase.execute({
      payload: { compraId: 1, nome: "João" },
    });

    expect(resultado).toBeDefined();
    expect(typeof resultado).toBe("string");
  });
});

describe("ValidarHashUseCase", () => {
  test("deve ser capaz de instanciar o use case", () => {
    const repository = new FakeHashRepository();
    const useCase = new ValidarHashUseCase(repository);
    expect(useCase).toBeInstanceOf(ValidarHashUseCase);
  });

  test("deve validar um hash correto", async () => {
    const repository = new FakeHashRepository();
    const useCase = new ValidarHashUseCase(repository);
    const payload = { compraId: 1 };
    const hash = await repository.generateHash(payload);

    const resultado = await useCase.execute({ payload, hashEsperado: hash });

    expect(resultado).toBe(true);
  });

  test("deve rejeitar um hash incorreto", async () => {
    const repository = new FakeHashRepository();
    const useCase = new ValidarHashUseCase(repository);

    const resultado = await useCase.execute({
      payload: { compraId: 1 },
      hashEsperado: "hash_invalido",
    });

    expect(resultado).toBe(false);
  });
});

describe("GerarHashUnicoUseCase", () => {
  test("deve instanciar corretamente", () => {
    const repository = new FakeHashRepository();
    const useCase = new GerarHashUnicoUseCase(repository);

    expect(useCase).toBeDefined();
  });

  test("deve gerar um hash único", async () => {
    const repository = new FakeHashRepository();
    const useCase = new GerarHashUnicoUseCase(repository);

    const resultado = await useCase.execute({ payload: { compraId: 1 } });

    expect(resultado).toBeDefined();
    expect(typeof resultado).toBe("string");
  });

  test("deve gerar hashes diferentes para a mesma entrada", async () => {
    const repository = new FakeHashRepository();
    const useCase = new GerarHashUnicoUseCase(repository);

    const hash1 = await useCase.execute({ payload: { compraId: 1 } });
    await new Promise((resolve) => setTimeout(resolve, 1)); // Pequeno delay
    const hash2 = await useCase.execute({ payload: { compraId: 1 } });

    expect(hash1).not.toBe(hash2);
  });
});
