import { Usuario, UsuarioProps } from '../../domain/entities/usuario';
import { UsuarioRepository } from '../../domain/repositories';
import { DatabaseConnection } from '../../infra/database/connection';

export class SqliteUsuarioRepository implements UsuarioRepository {
  private db = DatabaseConnection.getInstance();

  async salvar(usuario: Usuario): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO usuarios (
          id, nome_completo, email, telefone, documento,
          curso, numero_matricula, tipo, criado_em, atualizado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        usuario.id,
        usuario.nomeCompleto,
        usuario.email,
        usuario.telefone,
        usuario.documento,
        usuario.curso,
        usuario.numeroMatricula,
        usuario.tipo,
        usuario.criadoEm.toISOString(),
        usuario.atualizadoEm.toISOString()
      ], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usuarios WHERE id = ?';

      this.db.get(sql, [id], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const usuario = this.mapRowToUsuario(row);
            resolve(usuario);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usuarios WHERE email = ?';

      this.db.get(sql, [email], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const usuario = this.mapRowToUsuario(row);
            resolve(usuario);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async buscarPorDocumento(documento: string): Promise<Usuario | null> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usuarios WHERE documento = ?';

      this.db.get(sql, [documento], (err: any, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            const usuario = this.mapRowToUsuario(row);
            resolve(usuario);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async listarTodos(): Promise<Usuario[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM usuarios ORDER BY nome_completo ASC';

      this.db.all(sql, [], (err: any, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          try {
            const usuarios = rows.map(row => this.mapRowToUsuario(row));
            resolve(usuarios);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async atualizar(usuario: Usuario): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE usuarios SET
          nome_completo = ?, email = ?, telefone = ?, documento = ?,
          curso = ?, numero_matricula = ?, tipo = ?, atualizado_em = ?
        WHERE id = ?
      `;

      this.db.run(sql, [
        usuario.nomeCompleto,
        usuario.email,
        usuario.telefone,
        usuario.documento,
        usuario.curso,
        usuario.numeroMatricula,
        usuario.tipo,
        usuario.atualizadoEm.toISOString(),
        usuario.id
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
      const sql = 'DELETE FROM usuarios WHERE id = ?';

      this.db.run(sql, [id], (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private mapRowToUsuario(row: any): Usuario {
    const usuarioProps: UsuarioProps = {
      id: row.id,
      nomeCompleto: row.nome_completo,
      email: row.email,
      telefone: row.telefone,
      documento: row.documento,
      curso: row.curso,
      numeroMatricula: row.numero_matricula,
      tipo: row.tipo,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };

    return new Usuario(usuarioProps);
  }
}
