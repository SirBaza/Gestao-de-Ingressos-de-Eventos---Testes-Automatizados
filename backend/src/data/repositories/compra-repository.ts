import { Compra, CompraProps } from '../../domain/entities/compra';
import { CompraRepository } from '../../domain/repositories';
import { DatabaseConnection } from '../../infra/database/connection';

export class SqliteCompraRepository implements CompraRepository {
  private db = DatabaseConnection.getInstance();

  async salvar(compra: Compra): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO compras (
          id, usuario_id, evento_id, ingresso_id, quantidade,
          valor_total, codigo_qr, status, hash_seguranca,
          criado_em, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        compra.id,
        compra.usuarioId,
        compra.eventoId,
        compra.ingressoId,
        compra.quantidade,
        compra.valorTotal,
        compra.codigoQR,
        compra.status,
        compra.hashSeguranca,
        compra.criadoEm.toISOString(),
        compra.atualizadoEm.toISOString()
      ], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async buscarPorId(id: string): Promise<Compra | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM compras WHERE id = ?';

      this.db.get(sql, [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const compra = this.mapRowToCompra(row);
            resolve(compra);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async buscarPorCodigoQR(codigoQR: string): Promise<Compra | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM compras WHERE codigo_qr = ?';

      this.db.get(sql, [codigoQR], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const compra = this.mapRowToCompra(row);
            resolve(compra);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async listarPorUsuario(usuarioId: string): Promise<Compra[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM compras WHERE usuario_id = ? ORDER BY criado_em DESC';

      this.db.all(sql, [usuarioId], (err: any, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const compras = rows.map(row => this.mapRowToCompra(row));
            resolve(compras);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async listarPorEvento(eventoId: string): Promise<Compra[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM compras WHERE evento_id = ? ORDER BY criado_em DESC';

      this.db.all(sql, [eventoId], (err: any, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const compras = rows.map(row => this.mapRowToCompra(row));
            resolve(compras);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async atualizar(compra: Compra): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE compras SET
          quantidade = ?, valor_total = ?, status = ?,
          hash_seguranca = ?, atualizado_em = ?
        WHERE id = ?
      `;

      this.db.run(sql, [
        compra.quantidade,
        compra.valorTotal,
        compra.status,
        compra.hashSeguranca,
        compra.atualizadoEm.toISOString(),
        compra.id
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
      const sql = 'DELETE FROM compras WHERE id = ?';

      this.db.run(sql, [id], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private mapRowToCompra(row: any): Compra {
    const compraProps: CompraProps = {
      id: row.id,
      usuarioId: row.usuario_id,
      eventoId: row.evento_id,
      ingressoId: row.ingresso_id,
      quantidade: row.quantidade,
      valorTotal: row.valor_total,
      codigoQR: row.codigo_qr,
      status: row.status,
      hashSeguranca: row.hash_seguranca,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };

    return new Compra(compraProps);
  }
}
