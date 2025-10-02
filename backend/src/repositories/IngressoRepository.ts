import { IIngressoRepository } from "../contracts/ingresso/IRepository";
import { Ingresso } from "../domain/entities/Ingresso";

export class IngressoRepository implements IIngressoRepository {
  private ingressos: Ingresso[] = [];
  private nextId = 1;

  async findById(id: number): Promise<Ingresso | null> {
    const ingresso = this.ingressos.find((i) => i.id === id);
    return ingresso || null;
  }

  async findAll(): Promise<Ingresso[]> {
    return [...this.ingressos];
  }

  async insert(obj: Omit<Ingresso, "id" | "criadoEm">): Promise<Ingresso> {
    const novoIngresso = new Ingresso(
      obj.compraId,
      obj.hash,
      obj.usado,
      this.nextId++,
      obj.dataUso,
      new Date()
    );

    this.ingressos.push(novoIngresso);
    return novoIngresso;
  }

  async update(id: number, obj: Partial<Ingresso>): Promise<Ingresso | null> {
    const index = this.ingressos.findIndex((i) => i.id === id);

    if (index === -1) {
      return null;
    }

    const ingressoAtual = this.ingressos[index];
    const ingressoAtualizado = new Ingresso(
      obj.compraId ?? ingressoAtual.compraId,
      obj.hash ?? ingressoAtual.hash,
      obj.usado ?? ingressoAtual.usado,
      ingressoAtual.id,
      obj.dataUso ?? ingressoAtual.dataUso,
      ingressoAtual.criadoEm
    );

    this.ingressos[index] = ingressoAtualizado;
    return ingressoAtualizado;
  }

  async delete(id: number): Promise<boolean> {
    const index = this.ingressos.findIndex((i) => i.id === id);

    if (index === -1) {
      return false;
    }

    this.ingressos.splice(index, 1);
    return true;
  }

  async findByHash(hash: string): Promise<Ingresso | null> {
    const ingresso = this.ingressos.find((i) => i.hash === hash);
    return ingresso || null;
  }

  async findByCompra(compraId: number): Promise<Ingresso[]> {
    return this.ingressos.filter((ingresso) => ingresso.compraId === compraId);
  }

  async markAsUsed(id: number): Promise<Ingresso | null> {
    const ingresso = this.ingressos.find((i) => i.id === id);

    if (!ingresso) {
      return null;
    }

    return this.update(id, { usado: true, dataUso: new Date() });
  }

  async checkIfUsed(hash: string): Promise<boolean> {
    const ingresso = this.ingressos.find((i) => i.hash === hash);
    return ingresso ? ingresso.usado : false;
  }
}
