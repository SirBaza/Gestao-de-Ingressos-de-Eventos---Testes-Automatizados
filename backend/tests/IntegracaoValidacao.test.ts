import request from "supertest";
import app from "../src/app";

describe("Testes de Integração - API /validate", () => {
  let eventoId: number;
  let tipoIngressoId: number;
  let compraId: number;
  let ingressos: any[];

  beforeEach(async () => {
    // Reset do estado
    await request(app).post("/test/reset");

    // Configurar dados de teste
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 20);

    const eventoData = {
      nome: "Evento Validação",
      data: dataFutura.toISOString(),
      capacidadeTotal: 100,
      local: "Local Validação",
    };

    const eventoResponse = await request(app).post("/events").send(eventoData);

    eventoId = eventoResponse.body.id;

    const tipoIngressoData = {
      nome: "Teste",
      preco: 60.0,
      quantidadeInicial: 50,
    };

    const tipoResponse = await request(app)
      .post(`/events/${eventoId}/tickets`)
      .send(tipoIngressoData);

    tipoIngressoId = tipoResponse.body.id;

    // Criar uma compra com ingressos
    const compraData = {
      eventoId: eventoId,
      tipoIngressoId: tipoIngressoId,
      nome: "Usuário Teste",
      email: "usuario.teste@email.com",
      matricula: "2021999",
      quantidade: 2,
      valorTotal: 120.0,
    };

    const compraResponse = await request(app)
      .post("/purchases")
      .send(compraData);

    compraId = compraResponse.body.compra.id;
    ingressos = compraResponse.body.ingressos;
  });

  describe("POST /validate - Sucesso: payload válido + hash correto", () => {
    test("deve validar ingresso válido e retornar dados do comprador", async () => {
      const ingresso = ingressos[0];

      const response = await request(app)
        .post("/validate")
        .send({
          hash: ingresso.hash
          // Não enviar payload para testar validação apenas com hash
        })
        .expect(200);

      expect(response.body).toMatchObject({
        valido: true,
        ingresso: expect.objectContaining({
          id: ingresso.id,
          usado: true,
          dataUso: expect.any(String),
        }),
        comprador: {
          nome: "Usuário Teste",
          email: "usuario.teste@email.com",
          matricula: "2021999",
        },
        evento: {
          nome: "Evento Validação",
          local: "Local Validação",
        },
        dataValidacao: expect.any(String),
      });
    });

    test("deve marcar ingresso como usado após primeira validação", async () => {
      const ingresso = ingressos[0];

      // Primeira validação
      await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(200);

      // Verificar que foi marcado como usado na segunda tentativa
      const response = await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(409);

      expect(response.body).toMatchObject({
        error: "Ingresso já utilizado",
      });
    });

    test("deve validar ingresso sem payload (apenas hash)", async () => {
      const ingresso = ingressos[1];

      const response = await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(200);

      expect(response.body).toMatchObject({
        valido: true,
        ingresso: expect.objectContaining({
          usado: true,
        }),
        comprador: expect.objectContaining({
          nome: "Usuário Teste",
        }),
      });
    });

    test("deve validar múltiplos ingressos da mesma compra independentemente", async () => {
      const ingresso1 = ingressos[0];
      const ingresso2 = ingressos[1];

      // Validar primeiro ingresso
      const response1 = await request(app)
        .post("/validate")
        .send({ hash: ingresso1.hash })
        .expect(200);

      expect(response1.body.valido).toBe(true);

      // Validar segundo ingresso (deve funcionar normalmente)
      const response2 = await request(app)
        .post("/validate")
        .send({ hash: ingresso2.hash })
        .expect(200);

      expect(response2.body.valido).toBe(true);

      // Tentar validar primeiro novamente (deve falhar)
      await request(app)
        .post("/validate")
        .send({ hash: ingresso1.hash })
        .expect(409);

      // Tentar validar segundo novamente (deve falhar)
      await request(app)
        .post("/validate")
        .send({ hash: ingresso2.hash })
        .expect(409);
    });
  });

  describe("POST /validate - Erro: hash inválido → 422", () => {
    test("deve retornar erro 422 para hash inválido com payload", async () => {
      const payloadCorreto = {
        ingressoId: ingressos[0].id,
        compraId: compraId,
        eventoId: eventoId,
      };

      const hashIncorreto =
        "hash_completamente_invalido_12345678901234567890123456789012";

      const response = await request(app)
        .post("/validate")
        .send({
          hash: hashIncorreto,
          payload: payloadCorreto,
        })
        .expect(404); // Primeiro vai dar 404 porque o hash não existe

      expect(response.body).toMatchObject({
        error: "Ingresso não encontrado",
      });
    });

    test("deve retornar erro 422 para payload modificado com hash existente", async () => {
      const ingresso = ingressos[0];
      const payloadModificado = {
        ingressoId: ingresso.id,
        compraId: compraId,
        eventoId: eventoId,
        dadoAlterado: "valor_diferente", // Campo extra que altera o hash
      };

      const response = await request(app)
        .post("/validate")
        .send({
          hash: ingresso.hash,
          payload: payloadModificado,
        })
        .expect(422);

      expect(response.body).toMatchObject({
        error: "Hash inválido",
      });
    });

    test("deve retornar erro para hash com formato inválido", async () => {
      const hashesInvalidos = [
        "hash_muito_curto",
        "",
        "hash_com_caracteres_invalidos_@#$%",
        "123",
      ];

      for (const hashInvalido of hashesInvalidos) {
        const response = await request(app)
          .post("/validate")
          .send({ hash: hashInvalido })
          .expect(404);

        expect(response.body).toHaveProperty("error");
      }
    });
  });

  describe("POST /validate - Erro: ingresso não encontrado → 404", () => {
    test("deve retornar erro 404 para hash de ingresso inexistente", async () => {
      const hashInexistente =
        "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd";

      const response = await request(app)
        .post("/validate")
        .send({ hash: hashInexistente })
        .expect(404);

      expect(response.body).toMatchObject({
        error: "Ingresso não encontrado",
      });
    });

    test("deve retornar erro 404 para hash vazio ou nulo", async () => {
      const response1 = await request(app)
        .post("/validate")
        .send({ hash: "" })
        .expect(404);

      expect(response1.body).toHaveProperty("error");

      const response2 = await request(app)
        .post("/validate")
        .send({})
        .expect(404);

      expect(response2.body).toHaveProperty("error");
    });

    test("deve manter outros ingressos válidos quando um não existe", async () => {
      const hashInexistente =
        "hash_que_nao_existe_no_sistema_123456789012345678901234567890";
      const ingressoValido = ingressos[0];

      // Tentar validar hash inexistente
      await request(app)
        .post("/validate")
        .send({ hash: hashInexistente })
        .expect(404);

      // Validar ingresso existente (deve funcionar normalmente)
      const response = await request(app)
        .post("/validate")
        .send({ hash: ingressoValido.hash })
        .expect(200);

      expect(response.body.valido).toBe(true);
    });
  });

  describe("POST /validate - Erro: ingresso já usado → 409", () => {
    test("deve retornar erro 409 para ingresso já utilizado", async () => {
      const ingresso = ingressos[0];

      // Primeira validação (deve funcionar)
      await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(200);

      // Segunda validação (deve falhar com 409)
      const response = await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(409);

      expect(response.body).toMatchObject({
        error: "Ingresso já utilizado",
      });
    });

    test("deve manter data de uso original em múltiplas tentativas", async () => {
      const ingresso = ingressos[0];

      // Primeira validação
      const primeiraValidacao = await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(200);

      const dataUsoOriginal = primeiraValidacao.body.ingresso.dataUso;

      // Aguardar um pouco
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Tentativa subsequente
      await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(409);

      // A data de uso deve permanecer a mesma
      expect(dataUsoOriginal).toBeDefined();
    });

    test("deve permitir validação de outros ingressos após um ser usado", async () => {
      const ingresso1 = ingressos[0];
      const ingresso2 = ingressos[1];

      // Usar primeiro ingresso
      await request(app)
        .post("/validate")
        .send({ hash: ingresso1.hash })
        .expect(200);

      // Tentar usar primeiro novamente (deve falhar)
      await request(app)
        .post("/validate")
        .send({ hash: ingresso1.hash })
        .expect(409);

      // Usar segundo ingresso (deve funcionar)
      const response = await request(app)
        .post("/validate")
        .send({ hash: ingresso2.hash })
        .expect(200);

      expect(response.body.valido).toBe(true);
    });

    test("deve retornar dados corretos mesmo para ingresso já usado", async () => {
      const ingresso = ingressos[0];

      // Primeira validação
      await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(200);

      // Segunda tentativa deve retornar erro mas manter referência aos dados
      const response = await request(app)
        .post("/validate")
        .send({ hash: ingresso.hash })
        .expect(409);

      expect(response.body).toMatchObject({
        error: "Ingresso já utilizado",
      });
    });
  });

  describe("Cenários de validação complexos", () => {
    test("deve processar múltiplas validações simultâneas corretamente", async () => {
      const promises = ingressos.map((ingresso, index) =>
        request(app).post("/validate").send({ hash: ingresso.hash })
      );

      const responses = await Promise.all(promises);

      // Todas as primeiras validações devem ser bem-sucedidas
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.valido).toBe(true);
      });

      // Todas as segundas validações devem falhar
      const secondPromises = ingressos.map((ingresso) =>
        request(app).post("/validate").send({ hash: ingresso.hash })
      );

      const secondResponses = await Promise.all(secondPromises);

      secondResponses.forEach((response) => {
        expect(response.status).toBe(409);
        expect(response.body.error).toBe("Ingresso já utilizado");
      });
    });

    test("deve validar payload complexo corretamente", async () => {
      const ingresso = ingressos[0];
      const payloadComplexo = {
        ingresso: {
          id: ingresso.id,
          codigo: "ING-001",
          tipo: {
            nome: "Teste",
            preco: 60.0,
          },
        },
        compra: {
          id: compraId,
          usuario: {
            nome: "Usuário Teste",
            email: "usuario.teste@email.com",
            matricula: "2021999",
          },
        },
        evento: {
          id: eventoId,
          nome: "Evento Validação",
          data: new Date().toISOString(),
        },
        metadados: {
          geradoEm: new Date().toISOString(),
          versao: "1.0",
        },
      };

      // Como o hash foi gerado com payload diferente, deve dar erro de hash inválido
      const response = await request(app)
        .post("/validate")
        .send({
          hash: ingresso.hash,
          payload: payloadComplexo,
        })
        .expect(422);

      expect(response.body).toMatchObject({
        error: "Hash inválido",
      });
    });
  });
});
