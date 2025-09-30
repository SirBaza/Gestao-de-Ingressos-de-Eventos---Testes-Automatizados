import { EventoService } from "../services/EventoService";
import { TipoIngressoService } from "../services/TipoIngressoService";
import { CompraService } from "../services/CompraService";
import { IngressoService } from "../services/IngressoService";
import { HashService } from "../services/HashService";

export class ApiController {
  private eventoService = new EventoService();
  private tipoIngressoService = new TipoIngressoService();
  private compraService = new CompraService();
  private ingressoService = new IngressoService();
  private hashService = new HashService();

  // Eventos
  getAllEvents() {
    return this.eventoService.listarEventos();
  }

  createEvent(eventData: any) {
    return this.eventoService.criarEvento(eventData);
  }

  // Tipos de ingresso
  createTicketType(eventId: number, ticketData: any) {
    const evento = this.eventoService.buscarEventoPorId(eventId);
    if (!evento) {
      throw new Error("Evento não encontrado");
    }

    return this.tipoIngressoService.criarTipoIngresso({
      ...ticketData,
      eventoId: eventId,
    });
  }

  // Compras
  createPurchase(purchaseData: any) {
    // Validar se o evento existe
    const evento = this.eventoService.buscarEventoPorId(purchaseData.eventoId);
    if (!evento) {
      const error = new Error("Evento não encontrado");
      (error as any).status = 404;
      throw error;
    }

    // Validar se o tipo de ingresso existe
    const tipoIngresso = this.tipoIngressoService.buscarTipoIngressoPorId(
      purchaseData.tipoIngressoId
    );
    if (!tipoIngresso) {
      const error = new Error("Tipo de ingresso não encontrado");
      (error as any).status = 404;
      throw error;
    }

    // Verificar capacidade total do evento
    const totalVendido = this.compraService.calcularTotalIngressosVendidos(
      purchaseData.eventoId
    );
    if (totalVendido + purchaseData.quantidade > evento.capacidadeTotal) {
      const error = new Error("Capacidade total do evento atingida");
      (error as any).status = 422;
      throw error;
    }

    // Verificar disponibilidade do tipo de ingresso
    if (
      !this.tipoIngressoService.verificarDisponibilidade(
        purchaseData.tipoIngressoId,
        purchaseData.quantidade
      )
    ) {
      const error = new Error("Quantidade solicitada não disponível");
      (error as any).status = 422;
      throw error;
    }

    // Criar a compra
    const compra = this.compraService.criarCompra(purchaseData);

    // Reduzir estoque
    this.tipoIngressoService.reduzirEstoque(
      purchaseData.tipoIngressoId,
      purchaseData.quantidade
    );

    // Gerar ingressos com QR codes
    const ingressos = [];
    for (let i = 0; i < purchaseData.quantidade; i++) {
      const payload = {
        ingressoId: Date.now() + i,
        compraId: compra.id,
        eventoId: purchaseData.eventoId,
        tipoIngressoId: purchaseData.tipoIngressoId,
        usuario: {
          nome: purchaseData.nome,
          email: purchaseData.email,
          matricula: purchaseData.matricula,
        },
        evento: {
          nome: evento.nome,
          data: evento.data.toISOString(),
          local: evento.local,
        },
        geradoEm: new Date().toISOString(),
      };

      const ingresso = this.ingressoService.criarIngresso(compra.id!, payload);
      ingressos.push({
        ...ingresso,
        qrCode: ingresso.hash, // O hash serve como QR code
      });
    }

    return {
      compra,
      ingressos,
    };
  }

  // Validação de ingresso
  validateTicket(hash: string, payload?: any) {
    // Verificar se o ingresso existe
    const ingresso = this.ingressoService.buscarIngressoPorHash(hash);
    if (!ingresso) {
      const error = new Error("Ingresso não encontrado");
      (error as any).status = 404;
      throw error;
    }

    // Verificar se já foi usado
    if (ingresso.usado) {
      const error = new Error("Ingresso já utilizado");
      (error as any).status = 409;
      throw error;
    }

    // Se payload foi fornecido, validar hash
    if (payload && !this.hashService.validarHash(payload, hash)) {
      const error = new Error("Hash inválido");
      (error as any).status = 422;
      throw error;
    }

    // Marcar como usado e retornar dados
    const resultado = this.ingressoService.validarIngresso(hash);

    if (resultado.valido) {
      // Buscar dados da compra
      const compra = this.compraService.buscarCompraPorId(ingresso.compraId);
      const evento = this.eventoService.buscarEventoPorId(compra!.eventoId);

      return {
        valido: true,
        ingresso: resultado.ingresso,
        comprador: {
          nome: compra!.nome,
          email: compra!.email,
          matricula: compra!.matricula,
        },
        evento: {
          nome: evento!.nome,
          data: evento!.data,
          local: evento!.local,
        },
        dataValidacao: new Date(),
      };
    }

    return resultado;
  }

  // Métodos auxiliares para os testes
  reset() {
    this.eventoService = new EventoService();
    this.tipoIngressoService = new TipoIngressoService();
    this.compraService = new CompraService();
    this.ingressoService = new IngressoService();
    this.hashService = new HashService();
  }
}
