export class Compra {
  constructor(
    public eventoId: number,
    public tipoIngressoId: number,
    public nome: string,
    public email: string,
    public matricula: string,
    public quantidade: number,
    public valorTotal: number,
    public id?: number,
    public criadoEm?: Date
  ) {}
}
