import request from "supertest";
import app from "../src/app";

describe("Testes de Integração - API REST", () => {
  beforeEach(async () => {
    // Reset do estado entre testes
    await request(app).post("/test/reset");
  });

  describe("API /events", () => {
    describe("GET /events - Lista todos os eventos", () => {
      test("deve retornar lista vazia quando não há eventos", async () => {
        const response = await request(app).get("/events").expect(200);

        expect(response.body).toEqual([]);
      });

      test("deve retornar todos os eventos cadastrados", async () => {
        // Criar alguns eventos primeiro
        const dataFutura1 = new Date();
        dataFutura1.setDate(dataFutura1.getDate() + 10);

        const dataFutura2 = new Date();
        dataFutura2.setDate(dataFutura2.getDate() + 20);

        const evento1 = {
          nome: "Evento 1",
          data: dataFutura1.toISOString(),
          capacidadeTotal: 100,
          local: "Local 1",
        };

        const evento2 = {
          nome: "Evento 2",
          data: dataFutura2.toISOString(),
          capacidadeTotal: 200,
          local: "Local 2",
        };

        await request(app).post("/events").send(evento1);
        await request(app).post("/events").send(evento2);

        const response = await request(app).get("/events").expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toMatchObject({ nome: "Evento 1" });
        expect(response.body[1]).toMatchObject({ nome: "Evento 2" });
      });
    });

    describe("POST /events - Cria evento válido e salva", () => {
      test("deve criar evento com dados válidos", async () => {
        const dataFutura = new Date();
        dataFutura.setDate(dataFutura.getDate() + 15);

        const eventoData = {
          nome: "Festival de Tecnologia",
          data: dataFutura.toISOString(),
          capacidadeTotal: 500,
          local: "Centro de Convenções",
        };

        const response = await request(app)
          .post("/events")
          .send(eventoData)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(Number),
          nome: eventoData.nome,
          capacidadeTotal: eventoData.capacidadeTotal,
          local: eventoData.local,
          criadoEm: expect.any(String),
        });

        expect(new Date(response.body.data)).toEqual(dataFutura);
      });

      test("deve rejeitar evento com data no passado", async () => {
        const dataPassada = new Date();
        dataPassada.setDate(dataPassada.getDate() - 5);

        const eventoData = {
          nome: "Evento no Passado",
          data: dataPassada.toISOString(),
          capacidadeTotal: 100,
          local: "Local Qualquer",
        };

        const response = await request(app)
          .post("/events")
          .send(eventoData)
          .expect(400);

        expect(response.body).toMatchObject({
          error: "Data do evento não pode ser no passado",
        });
      });

      test("deve rejeitar evento com dados incompletos", async () => {
        const eventoIncompleto = {
          nome: "Evento Incompleto",
          // Faltando outros campos obrigatórios
        };

        const response = await request(app)
          .post("/events")
          .send(eventoIncompleto)
          .expect(400);

        expect(response.body).toHaveProperty("error");
      });
    });
  });

  describe("API /events/:id/tickets", () => {
    let eventoId: number;

    beforeEach(async () => {
      // Criar um evento para os testes
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const eventoData = {
        nome: "Evento Teste",
        data: dataFutura.toISOString(),
        capacidadeTotal: 200,
        local: "Local Teste",
      };

      const eventoResponse = await request(app)
        .post("/events")
        .send(eventoData);

      eventoId = eventoResponse.body.id;
    });

    describe("POST /events/:id/tickets - Cria tipo de ingresso para evento existente", () => {
      test("deve criar tipo de ingresso para evento existente", async () => {
        const tipoIngressoData = {
          nome: "VIP",
          preco: 150.0,
          quantidadeInicial: 50,
        };

        const response = await request(app)
          .post(`/events/${eventoId}/tickets`)
          .send(tipoIngressoData)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(Number),
          eventoId: eventoId,
          nome: tipoIngressoData.nome,
          preco: tipoIngressoData.preco,
          quantidadeInicial: tipoIngressoData.quantidadeInicial,
          quantidadeDisponivel: tipoIngressoData.quantidadeInicial,
          criadoEm: expect.any(String),
        });
      });

      test("deve rejeitar criação de tipo de ingresso para evento inexistente", async () => {
        const eventoInexistente = 999;
        const tipoIngressoData = {
          nome: "Inexistente",
          preco: 100.0,
          quantidadeInicial: 30,
        };

        const response = await request(app)
          .post(`/events/${eventoInexistente}/tickets`)
          .send(tipoIngressoData)
          .expect(404);

        expect(response.body).toMatchObject({
          error: "Evento não encontrado",
        });
      });

      test("deve criar múltiplos tipos de ingresso para o mesmo evento", async () => {
        const tipoVIP = {
          nome: "VIP",
          preco: 200.0,
          quantidadeInicial: 25,
        };

        const tipoComum = {
          nome: "Comum",
          preco: 80.0,
          quantidadeInicial: 150,
        };

        const responseVIP = await request(app)
          .post(`/events/${eventoId}/tickets`)
          .send(tipoVIP)
          .expect(201);

        const responseComum = await request(app)
          .post(`/events/${eventoId}/tickets`)
          .send(tipoComum)
          .expect(201);

        expect(responseVIP.body.id).not.toBe(responseComum.body.id);
        expect(responseVIP.body.eventoId).toBe(eventoId);
        expect(responseComum.body.eventoId).toBe(eventoId);
      });
    });
  });

  describe("API /purchases", () => {
    let eventoId: number;
    let tipoIngressoId: number;

    beforeEach(async () => {
      // Criar evento e tipo de ingresso para os testes
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 25);

      const eventoData = {
        nome: "Evento Compra",
        data: dataFutura.toISOString(),
        capacidadeTotal: 100,
        local: "Local Compra",
      };

      const eventoResponse = await request(app)
        .post("/events")
        .send(eventoData);

      eventoId = eventoResponse.body.id;

      const tipoIngressoData = {
        nome: "Padrão",
        preco: 75.0,
        quantidadeInicial: 80,
      };

      const tipoResponse = await request(app)
        .post(`/events/${eventoId}/tickets`)
        .send(tipoIngressoData);

      tipoIngressoId = tipoResponse.body.id;
    });

    describe("POST /purchases - Cria compra válida, gera QR e reduz estoque", () => {
      test("deve criar compra válida com QR codes e reduzir estoque", async () => {
        const compraData = {
          eventoId: eventoId,
          tipoIngressoId: tipoIngressoId,
          nome: "João Silva",
          email: "joao.silva@email.com",
          matricula: "2021001",
          quantidade: 3,
          valorTotal: 225.0,
        };

        const response = await request(app)
          .post("/purchases")
          .send(compraData)
          .expect(201);

        expect(response.body).toMatchObject({
          compra: {
            id: expect.any(Number),
            eventoId: eventoId,
            tipoIngressoId: tipoIngressoId,
            nome: compraData.nome,
            email: compraData.email,
            matricula: compraData.matricula,
            quantidade: compraData.quantidade,
            valorTotal: compraData.valorTotal,
            criadoEm: expect.any(String),
          },
          ingressos: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              compraId: expect.any(Number),
              hash: expect.any(String),
              usado: false,
              qrCode: expect.any(String),
              criadoEm: expect.any(String),
            }),
          ]),
        });

        expect(response.body.ingressos).toHaveLength(3);

        // Verificar que todos os QR codes são únicos
        const qrCodes = response.body.ingressos.map((i: any) => i.qrCode);
        const uniqueQrCodes = new Set(qrCodes);
        expect(uniqueQrCodes.size).toBe(3);
      });

      test("deve validar campos obrigatórios na compra", async () => {
        const compraInvalida = {
          eventoId: eventoId,
          tipoIngressoId: tipoIngressoId,
          nome: "", // Nome vazio
          email: "email-invalido", // Email inválido
          matricula: "2021002",
          quantidade: 1,
          valorTotal: 75.0,
        };

        const response = await request(app)
          .post("/purchases")
          .send(compraInvalida)
          .expect(400);

        expect(response.body).toHaveProperty("error");
      });
    });

    describe("POST /purchases - Rejeita compra quando capacidade/estoque zerado", () => {
      test("deve rejeitar compra quando capacidade total do evento é atingida", async () => {
        // Criar evento com capacidade pequena
        const dataFutura = new Date();
        dataFutura.setDate(dataFutura.getDate() + 15);

        const eventoLimitado = {
          nome: "Evento Limitado",
          data: dataFutura.toISOString(),
          capacidadeTotal: 5,
          local: "Sala Pequena",
        };

        const eventoResponse = await request(app)
          .post("/events")
          .send(eventoLimitado);

        const tipoLimitado = {
          nome: "Limitado",
          preco: 50.0,
          quantidadeInicial: 10, // Mais que a capacidade do evento
        };

        const tipoResponse = await request(app)
          .post(`/events/${eventoResponse.body.id}/tickets`)
          .send(tipoLimitado);

        // Primeira compra que esgota a capacidade
        const compra1 = {
          eventoId: eventoResponse.body.id,
          tipoIngressoId: tipoResponse.body.id,
          nome: "Comprador 1",
          email: "comprador1@email.com",
          matricula: "2021001",
          quantidade: 5,
          valorTotal: 250.0,
        };

        await request(app).post("/purchases").send(compra1).expect(201);

        // Segunda compra que deve falhar
        const compra2 = {
          eventoId: eventoResponse.body.id,
          tipoIngressoId: tipoResponse.body.id,
          nome: "Comprador 2",
          email: "comprador2@email.com",
          matricula: "2021002",
          quantidade: 1,
          valorTotal: 50.0,
        };

        const response = await request(app)
          .post("/purchases")
          .send(compra2)
          .expect(422);

        expect(response.body).toMatchObject({
          error: "Capacidade total do evento atingida",
        });
      });

      test("deve rejeitar compra quando estoque do tipo de ingresso é zerado", async () => {
        // Criar tipo com estoque limitado
        const tipoEscasso = {
          nome: "Escasso",
          preco: 100.0,
          quantidadeInicial: 2,
        };

        const tipoResponse = await request(app)
          .post(`/events/${eventoId}/tickets`)
          .send(tipoEscasso);

        // Primeira compra que esgota o estoque
        const compra1 = {
          eventoId: eventoId,
          tipoIngressoId: tipoResponse.body.id,
          nome: "Comprador A",
          email: "compradora@email.com",
          matricula: "2021003",
          quantidade: 2,
          valorTotal: 200.0,
        };

        await request(app).post("/purchases").send(compra1).expect(201);

        // Segunda compra que deve falhar
        const compra2 = {
          eventoId: eventoId,
          tipoIngressoId: tipoResponse.body.id,
          nome: "Comprador B",
          email: "compradorb@email.com",
          matricula: "2021004",
          quantidade: 1,
          valorTotal: 100.0,
        };

        const response = await request(app)
          .post("/purchases")
          .send(compra2)
          .expect(422);

        expect(response.body.error).toMatch(/disponível|esgotados/);
      });

      test("deve rejeitar compra para evento inexistente", async () => {
        const compraInvalida = {
          eventoId: 999,
          tipoIngressoId: tipoIngressoId,
          nome: "Comprador Teste",
          email: "teste@email.com",
          matricula: "2021005",
          quantidade: 1,
          valorTotal: 75.0,
        };

        const response = await request(app)
          .post("/purchases")
          .send(compraInvalida)
          .expect(404);

        expect(response.body).toMatchObject({
          error: "Evento não encontrado",
        });
      });

      test("deve rejeitar compra para tipo de ingresso inexistente", async () => {
        const compraInvalida = {
          eventoId: eventoId,
          tipoIngressoId: 999,
          nome: "Comprador Teste",
          email: "teste@email.com",
          matricula: "2021006",
          quantidade: 1,
          valorTotal: 75.0,
        };

        const response = await request(app)
          .post("/purchases")
          .send(compraInvalida)
          .expect(404);

        expect(response.body).toMatchObject({
          error: "Tipo de ingresso não encontrado",
        });
      });
    });
  });
});
