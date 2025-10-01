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
      // === ETAPA 1: Buscar eventos disponíveis ===
      const eventosResponse = await request(app).get("/events").expect(200);

      expect(Array.isArray(eventosResponse.body)).toBe(true);

      if (eventosResponse.body.length === 0) {
        // Se não há eventos, pular o teste ou criar um
        console.log("Nenhum evento encontrado para teste E2E");
        return;
      }

      const evento = eventosResponse.body[0];

      // === ETAPA 2: Realizar compra ===
      const dadosCompra = {
        nome: "Maria Silva E2E",
        email: "maria.e2e@teste.com",
        matricula: "E2E001",
        quantidade: 1,
        eventoId: evento.id,
        tipoIngressoId: 1,
      };

      const compraResponse = await request(app)
        .post("/purchases")
        .send(dadosCompra);

      if (compraResponse.status !== 201) {
        console.log("Erro na compra:", compraResponse.body);
        expect(compraResponse.status).toBe(201);
      }

      expect(compraResponse.body.sucesso).toBe(true);
      expect(compraResponse.body.ingressos).toHaveLength(1);

      const hashIngresso = compraResponse.body.ingressos[0].hash;

      // === ETAPA 3: Validar ingresso ===
      const validacaoResponse = await request(app)
        .post("/validate")
        .send({ hash: hashIngresso })
        .expect(200);

      expect(validacaoResponse.body.valido).toBe(true);
      expect(validacaoResponse.body.comprador.nome).toBe("Maria Silva E2E");

      // === ETAPA 4: Tentar validar novamente (deve falhar) ===
      const validacaoRepetidaResponse = await request(app)
        .post("/validate")
        .send({ hash: hashIngresso })
        .expect(400);

      expect(validacaoRepetidaResponse.body.valido).toBe(false);
    });

    test("deve tratar hash inválido", async () => {
      const hashInvalido = "hash_inexistente_123";

      const validacaoResponse = await request(app)
        .post("/validate")
        .send({ hash: hashInvalido })
        .expect(404);

      expect(validacaoResponse.body.valido).toBe(false);
      expect(validacaoResponse.body.error).toMatch(/não encontrado/i);
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
