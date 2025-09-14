import { Evento, TipoIngresso, CriarEventoDto } from '../tipos';
import { v4 as uuidv4 } from 'uuid';

// Simulação de banco de dados em memória
let eventos: Evento[] = [];
let tiposIngresso: TipoIngresso[] = [];

export class ModeloEvento {
  static async criarEvento(dadosEvento: CriarEventoDto, organizadorId: string): Promise<Evento> {
    const novoEvento: Evento = {
      id: uuidv4(),
      nome: dadosEvento.nome,
      descricao: dadosEvento.descricao,
      data: new Date(dadosEvento.data),
      local: dadosEvento.local,
      capacidadeMaxima: dadosEvento.capacidadeMaxima,
      organizadorId,
      tiposIngresso: [],
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    eventos.push(novoEvento);

    // Criar tipos de ingresso
    for (const tipoDto of dadosEvento.tiposIngresso) {
      const novoTipo: TipoIngresso = {
        id: uuidv4(),
        nome: tipoDto.nome,
        preco: tipoDto.preco,
        quantidadeDisponivel: tipoDto.quantidadeDisponivel,
        quantidadeVendida: 0,
        eventoId: novoEvento.id
      };
      tiposIngresso.push(novoTipo);
      novoEvento.tiposIngresso.push(novoTipo);
    }

    return novoEvento;
  }

  static async buscarPorId(id: string): Promise<Evento | null> {
    const evento = eventos.find(e => e.id === id);
    if (!evento) return null;

    // Buscar tipos de ingresso do evento
    const tiposDoEvento = tiposIngresso.filter(t => t.eventoId === id);
    return { ...evento, tiposIngresso: tiposDoEvento };
  }

  static async listarEventos(): Promise<Evento[]> {
    return eventos.map(evento => ({
      ...evento,
      tiposIngresso: tiposIngresso.filter(t => t.eventoId === evento.id)
    }));
  }

  static async listarEventosPorOrganizador(organizadorId: string): Promise<Evento[]> {
    return eventos
      .filter(e => e.organizadorId === organizadorId)
      .map(evento => ({
        ...evento,
        tiposIngresso: tiposIngresso.filter(t => t.eventoId === evento.id)
      }));
  }

  static async atualizar(id: string, dadosAtualizacao: Partial<Omit<CriarEventoDto, 'tiposIngresso'>>): Promise<Evento | null> {
    const indiceEvento = eventos.findIndex(e => e.id === id);
    if (indiceEvento === -1) return null;

    const evento = eventos[indiceEvento];
    
    // Atualizar apenas campos básicos do evento
    if (dadosAtualizacao.nome) evento.nome = dadosAtualizacao.nome;
    if (dadosAtualizacao.descricao) evento.descricao = dadosAtualizacao.descricao;
    if (dadosAtualizacao.data) evento.data = new Date(dadosAtualizacao.data);
    if (dadosAtualizacao.local) evento.local = dadosAtualizacao.local;
    if (dadosAtualizacao.capacidadeMaxima) evento.capacidadeMaxima = dadosAtualizacao.capacidadeMaxima;
    evento.atualizadoEm = new Date();

    eventos[indiceEvento] = evento;
    
    // Retornar com tipos de ingresso
    return {
      ...evento,
      tiposIngresso: tiposIngresso.filter(t => t.eventoId === id)
    };
  }

  static async remover(id: string): Promise<boolean> {
    const indiceEvento = eventos.findIndex(e => e.id === id);
    if (indiceEvento === -1) return false;

    // Remover tipos de ingresso associados
    tiposIngresso = tiposIngresso.filter(t => t.eventoId !== id);
    
    eventos.splice(indiceEvento, 1);
    return true;
  }

  static async buscarTipoIngresso(tipoIngressoId: string): Promise<TipoIngresso | null> {
    return tiposIngresso.find(t => t.id === tipoIngressoId) || null;
  }

  static async atualizarQuantidadeVendida(tipoIngressoId: string, quantidade: number): Promise<boolean> {
    const indice = tiposIngresso.findIndex(t => t.id === tipoIngressoId);
    if (indice === -1) return false;

    tiposIngresso[indice].quantidadeVendida += quantidade;
    return true;
  }

  static async verificarDisponibilidade(tipoIngressoId: string, quantidade: number): Promise<boolean> {
    const tipo = tiposIngresso.find(t => t.id === tipoIngressoId);
    if (!tipo) return false;

    return (tipo.quantidadeDisponivel - tipo.quantidadeVendida) >= quantidade;
  }

  // Método para limpar dados (útil para testes)
  static limparDados(): void {
    eventos = [];
    tiposIngresso = [];
  }
}
