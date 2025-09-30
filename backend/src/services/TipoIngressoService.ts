import { TipoIngresso } from "../models/interfaces";

export class TipoIngressoService {
  private tiposIngresso: TipoIngresso[] = [];
  private nextId = 1;

  criarTipoIngresso(
    tipoIngresso: Omit<TipoIngresso, "id" | "criadoEm" | "quantidadeDisponivel">
  ): TipoIngresso {
    const novoTipoIngresso: TipoIngresso = {
      id: this.nextId++,
      ...tipoIngresso,
      quantidadeDisponivel: tipoIngresso.quantidadeInicial,
      criadoEm: new Date(),
    };

    this.tiposIngresso.push(novoTipoIngresso);
    return novoTipoIngresso;
  }

  buscarTipoIngressoPorId(id: number): TipoIngresso | undefined {
    return this.tiposIngresso.find((tipo) => tipo.id === id);
  }

  verificarDisponibilidade(id: number, quantidade: number): boolean {
    const tipoIngresso = this.buscarTipoIngressoPorId(id);
    if (!tipoIngresso) {
      throw new Error("Tipo de ingresso não encontrado");
    }

    return tipoIngresso.quantidadeDisponivel >= quantidade;
  }

  reduzirEstoque(id: number, quantidade: number): TipoIngresso {
    const tipoIngresso = this.buscarTipoIngressoPorId(id);
    if (!tipoIngresso) {
      throw new Error("Tipo de ingresso não encontrado");
    }

    if (tipoIngresso.quantidadeDisponivel === 0) {
      throw new Error("Ingressos esgotados");
    }

    if (tipoIngresso.quantidadeDisponivel < quantidade) {
      throw new Error("Quantidade solicitada maior que a disponível");
    }

    tipoIngresso.quantidadeDisponivel -= quantidade;
    return tipoIngresso;
  }

  listarPorEvento(eventoId: number): TipoIngresso[] {
    return this.tiposIngresso.filter((tipo) => tipo.eventoId === eventoId);
  }
}
