import { Evento, EventoProps } from '../../domain/entities/evento';
import { EventoRepository } from '../../domain/repositories';
import { DatabaseConnection } from '../../infra/database/connection';

export class SqliteEventoRepository implements EventoRepository {
  private db = DatabaseConnection.getInstance();

  async salvar(evento: Evento): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO eventos (
          id, nome, data, local, capacidade_maxima, organizador_id,
          descricao, status, criado_em, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        evento.id,
        evento.nome,
        evento.data.toISOString(),
        evento.local,
        evento.capacidadeMaxima,
        evento.organizadorId,
        evento.descricao,
        evento.status,
        evento.criadoEm.toISOString(),
        evento.atualizadoEm.toISOString()
      ], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async buscarPorId(id: string): Promise<Evento | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM eventos WHERE id = ?';

      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const evento = this.mapRowToEvento(row);
            resolve(evento);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async listarTodos(): Promise<Evento[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM eventos ORDER BY data ASC';

      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const eventos = rows.map(row => this.mapRowToEvento(row));
            resolve(eventos);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async listarPorOrganizador(organizadorId: string): Promise<Evento[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM eventos WHERE organizador_id = ? ORDER BY data ASC';

      this.db.all(sql, [organizadorId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const eventos = rows.map(row => this.mapRowToEvento(row));
            resolve(eventos);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async atualizar(evento: Evento): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE eventos SET
          nome = ?, data = ?, local = ?, capacidade_maxima = ?,
          descricao = ?, status = ?, atualizado_em = ?
        WHERE id = ?
      `;

      this.db.run(sql, [
        evento.nome,
        evento.data.toISOString(),
        evento.local,
        evento.capacidadeMaxima,
        evento.descricao,
        evento.status,
        evento.atualizadoEm.toISOString(),
        evento.id
      ], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async deletar(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM eventos WHERE id = ?';

      this.db.run(sql, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private mapRowToEvento(row: any): Evento {
    const eventoProps: EventoProps = {
      id: row.id,
      nome: row.nome,
      data: new Date(row.data),
      local: row.local,
      capacidadeMaxima: row.capacidade_maxima,
      organizadorId: row.organizador_id,
      descricao: row.descricao,
      status: row.status,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };

    return new Evento(eventoProps);
  }
}
