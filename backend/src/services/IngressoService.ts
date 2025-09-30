import { Ingresso } from "../models/interfaces";
import { HashService } from "./HashService";

export class IngressoService {
  private ingressos: Ingresso[] = [];
  private nextId = 1;
  private hashService = new HashService();

  criarIngresso(compraId: number, payload: any): Ingresso {
    const hash = this.hashService.gerarHash(payload);

    const novoIngresso: Ingresso = {
      id: this.nextId++,
      compraId,
      hash,
      usado: false,
      criadoEm: new Date(),
    };

    this.ingressos.push(novoIngresso);
    return novoIngresso;
  }

  buscarIngressoPorHash(hash: string): Ingresso | undefined {
    return this.ingressos.find((ingresso) => ingresso.hash === hash);
  }

  validarIngresso(hash: string): {
    valido: boolean;
    mensagem: string;
    ingresso?: Ingresso;
  } {
    const ingresso = this.buscarIngressoPorHash(hash);

    if (!ingresso) {
      return { valido: false, mensagem: "Ingresso não encontrado" };
    }

    if (ingresso.usado) {
      return { valido: false, mensagem: "Ingresso já utilizado", ingresso };
    }

    // Marcar como usado na primeira validação
    ingresso.usado = true;
    ingresso.dataUso = new Date();

    return {
      valido: true,
      mensagem: "Ingresso válido e marcado como usado",
      ingresso,
    };
  }

  verificarSeJaFoiUsado(hash: string): boolean {
    const ingresso = this.buscarIngressoPorHash(hash);
    return ingresso ? ingresso.usado : false;
  }

  listarIngressosPorCompra(compraId: number): Ingresso[] {
    return this.ingressos.filter((ingresso) => ingresso.compraId === compraId);
  }
}
