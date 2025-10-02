export class Evento {
  constructor(
    public nome: string,
    public data: Date,
    public capacidadeTotal: number,
    public local: string,
    public id?: number,
    public criadoEm?: Date
  ) {}
}
