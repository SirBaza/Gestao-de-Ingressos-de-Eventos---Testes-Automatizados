export class TipoIngresso {
  constructor(
    public eventoId: number,
    public nome: string,
    public preco: number,
    public quantidadeDisponivel: number,
    public quantidadeInicial: number,
    public id?: number,
    public criadoEm?: Date
  ) {}
}
