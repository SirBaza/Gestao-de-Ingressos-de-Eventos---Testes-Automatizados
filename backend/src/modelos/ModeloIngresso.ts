import { Ingresso, ComprarIngressoDto } from '../tipos';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Simulação de banco de dados em memória
let ingressos: Ingresso[] = [];

export class ModeloIngresso {
  static async criarIngresso(dadosCompra: ComprarIngressoDto, tipoIngressoId: string, eventoId: string): Promise<Ingresso[]> {
    const ingressosCriados: Ingresso[] = [];

    for (let i = 0; i < dadosCompra.quantidade; i++) {
      const id = uuidv4();
      const codigoQr = this.gerarCodigoQr(id, eventoId);
      const hashSeguranca = this.gerarHashSeguranca(codigoQr);

      const novoIngresso: Ingresso = {
        id,
        codigoQr,
        eventoId,
        tipoIngressoId,
        compradorId: id, // Para simplificar, usando o mesmo ID
        nomeComprador: dadosCompra.comprador.nome,
        emailComprador: dadosCompra.comprador.email,
        telefoneComprador: dadosCompra.comprador.telefone,
        usado: false,
        dataCompra: new Date(),
        hashSeguranca
      };

      ingressos.push(novoIngresso);
      ingressosCriados.push(novoIngresso);
    }

    return ingressosCriados;
  }

  static async buscarPorId(id: string): Promise<Ingresso | null> {
    return ingressos.find(i => i.id === id) || null;
  }

  static async buscarPorCodigoQr(codigoQr: string): Promise<Ingresso | null> {
    return ingressos.find(i => i.codigoQr === codigoQr) || null;
  }

  static async buscarPorEvento(eventoId: string): Promise<Ingresso[]> {
    return ingressos.filter(i => i.eventoId === eventoId);
  }

  static async buscarPorComprador(emailComprador: string): Promise<Ingresso[]> {
    return ingressos.filter(i => i.emailComprador === emailComprador);
  }

  static async marcarComoUsado(id: string): Promise<boolean> {
    const indice = ingressos.findIndex(i => i.id === id);
    if (indice === -1) return false;

    ingressos[indice].usado = true;
    ingressos[indice].dataUso = new Date();
    return true;
  }

  static async validarIngresso(codigoQr: string): Promise<{
    valido: boolean;
    ingresso?: Ingresso;
    motivo?: string;
  }> {
    const ingresso = await this.buscarPorCodigoQr(codigoQr);
    
    if (!ingresso) {
      return { valido: false, motivo: 'Ingresso não encontrado' };
    }

    if (ingresso.usado) {
      return { valido: false, ingresso, motivo: 'Ingresso já foi usado' };
    }

    // Verificar hash de segurança
    const hashCalculado = this.gerarHashSeguranca(codigoQr);
    if (hashCalculado !== ingresso.hashSeguranca) {
      return { valido: false, ingresso, motivo: 'Código QR inválido ou adulterado' };
    }

    return { valido: true, ingresso };
  }

  static gerarCodigoQr(ingressoId: string, eventoId: string): string {
    // Gerar um código QR único baseado no ID do ingresso e evento
    const dados = `${ingressoId}-${eventoId}-${Date.now()}`;
    return Buffer.from(dados).toString('base64');
  }

  static gerarHashSeguranca(codigoQr: string): string {
    // Gerar hash SHA256 para verificação de integridade
    return crypto.createHash('sha256').update(codigoQr + 'chave-secreta-sistema').digest('hex');
  }

  static async contarIngressosVendidos(eventoId: string): Promise<number> {
    return ingressos.filter(i => i.eventoId === eventoId).length;
  }

  static async contarIngressosUsados(eventoId: string): Promise<number> {
    return ingressos.filter(i => i.eventoId === eventoId && i.usado).length;
  }

  // Método para limpar dados (útil para testes)
  static limparDados(): void {
    ingressos = [];
  }
}
