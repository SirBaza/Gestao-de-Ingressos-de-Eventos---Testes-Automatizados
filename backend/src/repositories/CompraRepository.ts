import { ICompraRepository } from "../contracts/compra/IRepository";
import { Compra } from "../domain/entities/Compra";

export class CompraRepository implements ICompraRepository {
  private compras: Compra[] = [];
  private nextId = 1;

  async findById(id: number): Promise<Compra | null> {
    const compra = this.compras.find((c) => c.id === id);
    return compra || null;
  }

  async findAll(): Promise<Compra[]> {
    return [...this.compras];
  }

  async insert(obj: Omit<Compra, "id" | "criadoEm">): Promise<Compra> {
    const novaCompra = new Compra(
      obj.eventoId,
      obj.tipoIngressoId,
      obj.nome,
      obj.email,
      obj.matricula,
      obj.quantidade,
      obj.valorTotal,
      this.nextId++,
      new Date()
    );

    this.compras.push(novaCompra);
    return novaCompra;
  }

  async update(id: number, obj: Partial<Compra>): Promise<Compra | null> {
    const index = this.compras.findIndex((c) => c.id === id);

    if (index === -1) {
      return null;
    }

    const compraAtual = this.compras[index];
    const compraAtualizada = new Compra(
      obj.eventoId ?? compraAtual.eventoId,
      obj.tipoIngressoId ?? compraAtual.tipoIngressoId,
      obj.nome ?? compraAtual.nome,
      obj.email ?? compraAtual.email,
      obj.matricula ?? compraAtual.matricula,
      obj.quantidade ?? compraAtual.quantidade,
      obj.valorTotal ?? compraAtual.valorTotal,
      compraAtual.id,
      compraAtual.criadoEm
    );

    this.compras[index] = compraAtualizada;
    return compraAtualizada;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.compras.findIndex((c) => c.id === id);

    if (index === -1) {
      return false;
    }

    this.compras.splice(index, 1);
    return true;
  }

  async findByEvento(eventoId: number): Promise<Compra[]> {
    return this.compras.filter((compra) => compra.eventoId === eventoId);
  }

  async findByEmail(email: string): Promise<Compra[]> {
    return this.compras.filter((compra) => compra.email === email);
  }

  async calculateTotalTicketsSold(eventoId: number): Promise<number> {
    return this.compras
      .filter((compra) => compra.eventoId === eventoId)
      .reduce((total, compra) => total + compra.quantidade, 0);
  }

  async calculateTotalRevenue(eventoId: number): Promise<number> {
    return this.compras
      .filter((compra) => compra.eventoId === eventoId)
      .reduce((total, compra) => total + compra.valorTotal, 0);
  }
}
