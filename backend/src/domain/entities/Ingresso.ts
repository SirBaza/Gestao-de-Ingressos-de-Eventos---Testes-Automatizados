export class Ingresso {
  constructor(
    public compraId: number,
    public hash: string,
    public usado: boolean,
    public id?: number,
    public dataUso?: Date,
    public criadoEm?: Date
  ) {}
}
