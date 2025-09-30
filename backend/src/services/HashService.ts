import crypto from "crypto";

export class HashService {
  gerarHash(payload: any): string {
    const data = JSON.stringify(payload);
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  validarHash(payload: any, hashEsperado: string): boolean {
    const hashGerado = this.gerarHash(payload);
    return hashGerado === hashEsperado;
  }
}
