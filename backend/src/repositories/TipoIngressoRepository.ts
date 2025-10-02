import { ITipoIngressoRepository } from "../contracts/tipoIngresso/IRepository";
import { TipoIngresso } from "../domain/entities/TipoIngresso";

export class TipoIngressoRepository implements ITipoIngressoRepository {
  private tiposIngresso: TipoIngresso[] = [];
  private nextId = 1;

  async findById(id: number): Promise<TipoIngresso | null> {
    const tipoIngresso = this.tiposIngresso.find((t) => t.id === id);
    return tipoIngresso || null;
  }

  async findAll(): Promise<TipoIngresso[]> {
    return [...this.tiposIngresso];
  }

  async insert(
    obj: Omit<TipoIngresso, "id" | "criadoEm">
  ): Promise<TipoIngresso> {
    const novoTipoIngresso = new TipoIngresso(
      obj.eventoId,
      obj.nome,
      obj.preco,
      obj.quantidadeDisponivel,
      obj.quantidadeInicial,
      this.nextId++,
      new Date()
    );

    this.tiposIngresso.push(novoTipoIngresso);
    return novoTipoIngresso;
  }

  async update(
    id: number,
    obj: Partial<TipoIngresso>
  ): Promise<TipoIngresso | null> {
    const index = this.tiposIngresso.findIndex((t) => t.id === id);

    if (index === -1) {
      return null;
    }

    const tipoAtual = this.tiposIngresso[index];
    const tipoAtualizado = new TipoIngresso(
      obj.eventoId ?? tipoAtual.eventoId,
      obj.nome ?? tipoAtual.nome,
      obj.preco ?? tipoAtual.preco,
      obj.quantidadeDisponivel ?? tipoAtual.quantidadeDisponivel,
      obj.quantidadeInicial ?? tipoAtual.quantidadeInicial,
      tipoAtual.id,
      tipoAtual.criadoEm
    );

    this.tiposIngresso[index] = tipoAtualizado;
    return tipoAtualizado;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.tiposIngresso.findIndex((t) => t.id === id);

    if (index === -1) {
      return false;
    }

    this.tiposIngresso.splice(index, 1);
    return true;
  }

  async findByEvento(eventoId: number): Promise<TipoIngresso[]> {
    return this.tiposIngresso.filter((tipo) => tipo.eventoId === eventoId);
  }

  async checkAvailability(id: number, quantidade: number): Promise<boolean> {
    const tipoIngresso = this.tiposIngresso.find((t) => t.id === id);

    if (!tipoIngresso) {
      return false;
    }

    return tipoIngresso.quantidadeDisponivel >= quantidade;
  }

  async reduceStock(
    id: number,
    quantidade: number
  ): Promise<TipoIngresso | null> {
    const tipoIngresso = this.tiposIngresso.find((t) => t.id === id);

    if (!tipoIngresso) {
      return null;
    }

    if (tipoIngresso.quantidadeDisponivel < quantidade) {
      return null;
    }

    const novaQuantidade = tipoIngresso.quantidadeDisponivel - quantidade;
    return this.update(id, { quantidadeDisponivel: novaQuantidade });
  }

  async restoreStock(
    id: number,
    quantidade: number
  ): Promise<TipoIngresso | null> {
    const tipoIngresso = this.tiposIngresso.find((t) => t.id === id);

    if (!tipoIngresso) {
      return null;
    }

    const novaQuantidade = tipoIngresso.quantidadeDisponivel + quantidade;
    return this.update(id, { quantidadeDisponivel: novaQuantidade });
  }
}
