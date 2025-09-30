import { Compra } from "../models/interfaces";

export class CompraService {
  private compras: Compra[] = [];
  private nextId = 1;

  criarCompra(compra: Omit<Compra, "id" | "criadoEm">): Compra {
    // Validar campos obrigatórios
    if (!compra.nome || compra.nome.trim() === "") {
      throw new Error("Nome é obrigatório");
    }

    if (!compra.email || compra.email.trim() === "") {
      throw new Error("E-mail é obrigatório");
    }

    if (!compra.matricula || compra.matricula.trim() === "") {
      throw new Error("Matrícula é obrigatória");
    }

    // Validar formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(compra.email)) {
      throw new Error("E-mail deve ter formato válido");
    }

    const novaCompra: Compra = {
      id: this.nextId++,
      ...compra,
      criadoEm: new Date(),
    };

    this.compras.push(novaCompra);
    return novaCompra;
  }

  buscarCompraPorId(id: number): Compra | undefined {
    return this.compras.find((compra) => compra.id === id);
  }

  listarComprasPorEvento(eventoId: number): Compra[] {
    return this.compras.filter((compra) => compra.eventoId === eventoId);
  }

  calcularTotalIngressosVendidos(eventoId: number): number {
    return this.compras
      .filter((compra) => compra.eventoId === eventoId)
      .reduce((total, compra) => total + compra.quantidade, 0);
  }
}
