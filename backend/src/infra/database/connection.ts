import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

export class DatabaseConnection {
  private static instance: Database;

  static getInstance(): Database {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new sqlite3.Database('./database.sqlite');
    }
    return DatabaseConnection.instance;
  }

  static async initializeDatabase(): Promise<void> {
    const db = DatabaseConnection.getInstance();

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Tabela de usuários
        db.run(`
          CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY,
            nome_completo TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefone TEXT NOT NULL,
            documento TEXT UNIQUE NOT NULL,
            curso TEXT,
            numero_matricula TEXT,
            tipo TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Tabela de eventos
        db.run(`
          CREATE TABLE IF NOT EXISTS eventos (
            id TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            data DATETIME NOT NULL,
            local TEXT NOT NULL,
            capacidade_maxima INTEGER NOT NULL,
            organizador_id TEXT NOT NULL,
            descricao TEXT,
            status TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (organizador_id) REFERENCES usuarios (id)
          )
        `);

        // Tabela de ingressos
        db.run(`
          CREATE TABLE IF NOT EXISTS ingressos (
            id TEXT PRIMARY KEY,
            evento_id TEXT NOT NULL,
            tipo TEXT NOT NULL,
            preco REAL NOT NULL,
            quantidade_disponivel INTEGER NOT NULL,
            descricao TEXT,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (evento_id) REFERENCES eventos (id)
          )
        `);

        // Tabela de compras
        db.run(`
          CREATE TABLE IF NOT EXISTS compras (
            id TEXT PRIMARY KEY,
            usuario_id TEXT NOT NULL,
            evento_id TEXT NOT NULL,
            ingresso_id TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            valor_total REAL NOT NULL,
            codigo_qr TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            hash_seguranca TEXT NOT NULL,
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
            FOREIGN KEY (evento_id) REFERENCES eventos (id),
            FOREIGN KEY (ingresso_id) REFERENCES ingressos (id)
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  static close(): void {
    if (DatabaseConnection.instance) {
      DatabaseConnection.instance.close();
    }
  }
}
