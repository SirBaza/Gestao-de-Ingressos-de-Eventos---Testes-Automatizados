import { Ingresso, IngressoProps, TipoIngresso } from '../../domain/entities/ingresso';
import { IngressoRepository } from '../../domain/repositories';
import { DatabaseConnection } from '../../infra/database/connection';

export class SqliteIngressoRepository implements IngressoRepository {
  private db = DatabaseConnection.getInstance();

  async salvar(ingresso: Ingresso): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO ingressos (
          id, evento_id, tipo, preco, quantidade_disponivel,
          descricao, criado_em, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        ingresso.id,
        ingresso.eventoId,
        ingresso.tipo,
        ingresso.preco,
        ingresso.quantidadeDisponivel,
        ingresso.descricao,
        ingresso.criadoEm.toISOString(),
        ingresso.atualizadoEm.toISOString()
      ], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async buscarPorId(id: string): Promise<Ingresso | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM ingressos WHERE id = ?';

      this.db.get(sql, [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const ingresso = this.mapRowToIngresso(row);
            resolve(ingresso);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async listarPorEvento(eventoId: string): Promise<Ingresso[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM ingressos WHERE evento_id = ?';

      this.db.all(sql, [eventoId], (err: any, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const ingressos = rows.map(row => this.mapRowToIngresso(row));
            resolve(ingressos);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async atualizar(ingresso: Ingresso): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE ingressos SET
          tipo = ?, preco = ?, quantidade_disponivel = ?,
          descricao = ?, atualizado_em = ?
        WHERE id = ?
      `;

      this.db.run(sql, [
        ingresso.tipo,
        ingresso.preco,
        ingresso.quantidadeDisponivel,
        ingresso.descricao,
        ingresso.atualizadoEm.toISOString(),
        ingresso.id
      ], (err: any) => {
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
      const sql = 'DELETE FROM ingressos WHERE id = ?';

      this.db.run(sql, [id], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private mapRowToIngresso(row: any): Ingresso {
    const ingressoProps: IngressoProps = {
      id: row.id,
      eventoId: row.evento_id,
      tipo: row.tipo as TipoIngresso,
      preco: row.preco,
      quantidadeDisponivel: row.quantidade_disponivel,
      descricao: row.descricao,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };

    return new Ingresso(ingressoProps);
  }
}
