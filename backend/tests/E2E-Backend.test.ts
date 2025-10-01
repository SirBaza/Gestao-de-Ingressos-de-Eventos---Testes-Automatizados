import request from "supertest";
import app from "../src/app";

describe("E2E - Backend - Fluxos Completos", () => {
  beforeEach(async () => {
    // Reset do estado entre testes
    if (process.env.NODE_ENV === "test") {
      await request(app).post("/test/reset");
    }
  });

  describe("Fluxo E2E: Compra → Validação", () => {
    test("deve completar fluxo básico de compra e validação", async () => {
      // === ETAPA 1: Criar um evento para teste ===
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const novoEvento = {
        nome: "Evento E2E Teste",
        data: dataFutura.toISOString(),
        capacidadeTotal: 50,
        local: "Centro de Convenções E2E",
      };

      const eventoResponse = await request(app)
        .post("/events")
        .send(novoEvento)
        .expect(201);

      expect(eventoResponse.body.id).toBeDefined();

      const evento = eventoResponse.body;

      // === ETAPA 1.5: Criar tipo de ingresso ===
      const tipoIngresso = {
        nome: "Ingresso Geral",
        preco: 50.0,
        quantidadeInicial: 50,
      };

      const tipoIngressoResponse = await request(app)
        .post(`/events/${evento.id}/tickets`)
        .send(tipoIngresso)
        .expect(201);

      expect(tipoIngressoResponse.body.id).toBeDefined();

      const tipoIngressoCriado = tipoIngressoResponse.body;

      // === ETAPA 2: Buscar eventos para confirmar ===
      const eventosResponse = await request(app).get("/events").expect(200);
      expect(Array.isArray(eventosResponse.body)).toBe(true);
      expect(eventosResponse.body.length).toBeGreaterThan(0);

      // === ETAPA 3: Realizar compra ===
      const dadosCompra = {
        nome: "Maria Silva E2E",
        email: "maria.e2e@teste.com",
        matricula: "E2E001",
        quantidade: 1,
        eventoId: evento.id,
        tipoIngressoId: tipoIngressoCriado.id,
      };

      const compraResponse = await request(app)
        .post("/purchases")
        .send(dadosCompra);

      if (compraResponse.status !== 201) {
        console.log("Erro na compra:", compraResponse.body);
        expect(compraResponse.status).toBe(201);
      }

      expect(compraResponse.body.compra).toBeDefined();
      expect(compraResponse.body.ingressos).toHaveLength(1);

      const hashIngresso = compraResponse.body.ingressos[0].hash;

      // === ETAPA 4: Validar ingresso ===
      const validacaoResponse = await request(app)
        .post("/validate")
        .send({ hash: hashIngresso })
        .expect(200);

      expect(validacaoResponse.body.valido).toBe(true);
      expect(validacaoResponse.body.comprador.nome).toBe("Maria Silva E2E");

      // === ETAPA 5: Tentar validar novamente (deve falhar) ===
      const validacaoRepetidaResponse = await request(app)
        .post("/validate")
        .send({ hash: hashIngresso })
        .expect(409);

      expect(validacaoRepetidaResponse.body.error).toBe(
        "Ingresso já utilizado"
      );
    });

    test("deve tratar hash inválido", async () => {
      const hashInvalido = "hash_inexistente_123";

      const validacaoResponse = await request(app)
        .post("/validate")
        .send({ hash: hashInvalido })
        .expect(404);

      expect(validacaoResponse.body.error).toBe("Ingresso não encontrado");
    });

    test("deve tratar compra com dados inválidos", async () => {
      const dadosInvalidos = {
        nome: "",
        email: "email-inválido",
        matricula: "",
        quantidade: 0,
        eventoId: 999,
        tipoIngressoId: 1,
      };

      const compraResponse = await request(app)
        .post("/purchases")
        .send(dadosInvalidos);

      expect(compraResponse.status).toBeGreaterThanOrEqual(400);
      expect(compraResponse.status).toBeLessThan(500);
    });
  });
});
