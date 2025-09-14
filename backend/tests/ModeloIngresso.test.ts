import { describe, test, expect, beforeEach } from 'vitest';
import { ModeloIngresso } from '../src/modelos/ModeloIngresso';
import { ComprarIngressoDto } from '../src/tipos';

describe('ModeloIngresso', () => {
  beforeEach(() => {
    ModeloIngresso.limparDados();
  });

  describe('criarIngresso', () => {
    test('deve criar ingressos válidos', async () => {
      const dadosCompra: ComprarIngressoDto = {
        eventoId: 'evento-123',
        tipoIngressoId: 'tipo-ingresso-456',
        quantidade: 2,
        comprador: {
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          telefone: '11999999999'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      expect(ingressos).toHaveLength(2);
      
      // Verificar primeiro ingresso
      expect(ingressos[0].id).toBeDefined();
      expect(ingressos[0].codigoQr).toBeDefined();
      expect(ingressos[0].eventoId).toBe('evento-123');
      expect(ingressos[0].tipoIngressoId).toBe('tipo-ingresso-456');
      expect(ingressos[0].nomeComprador).toBe('João Silva');
      expect(ingressos[0].emailComprador).toBe('joao@exemplo.com');
      expect(ingressos[0].telefoneComprador).toBe('11999999999');
      expect(ingressos[0].usado).toBe(false);
      expect(ingressos[0].dataCompra).toBeInstanceOf(Date);
      expect(ingressos[0].hashSeguranca).toBeDefined();

      // Verificar segundo ingresso
      expect(ingressos[1].id).toBeDefined();
      expect(ingressos[1].id).not.toBe(ingressos[0].id); // IDs diferentes
      expect(ingressos[1].codigoQr).not.toBe(ingressos[0].codigoQr); // QR codes diferentes
    });

    test('deve criar ingresso único quando quantidade é 1', async () => {
      const dadosCompra: ComprarIngressoDto = {
        eventoId: 'evento-789',
        tipoIngressoId: 'tipo-ingresso-101',
        quantidade: 1,
        comprador: {
          nome: 'Maria Santos',
          email: 'maria@exemplo.com'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      expect(ingressos).toHaveLength(1);
      expect(ingressos[0].nomeComprador).toBe('Maria Santos');
      expect(ingressos[0].emailComprador).toBe('maria@exemplo.com');
      expect(ingressos[0].telefoneComprador).toBeUndefined();
    });
  });

  describe('buscarPorId', () => {
    test('deve encontrar ingresso por ID', async () => {
      const dadosCompra: ComprarIngressoDto = {
        eventoId: 'evento-abc',
        tipoIngressoId: 'tipo-abc',
        quantidade: 1,
        comprador: {
          nome: 'Pedro Costa',
          email: 'pedro@exemplo.com'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      const ingressoEncontrado = await ModeloIngresso.buscarPorId(ingressos[0].id);

      expect(ingressoEncontrado).toBeTruthy();
      expect(ingressoEncontrado?.id).toBe(ingressos[0].id);
      expect(ingressoEncontrado?.nomeComprador).toBe('Pedro Costa');
    });

    test('deve retornar null para ID inexistente', async () => {
      const ingresso = await ModeloIngresso.buscarPorId('id-inexistente');
      expect(ingresso).toBeNull();
    });
  });

  describe('buscarPorCodigoQr', () => {
    test('deve encontrar ingresso por código QR', async () => {
      const dadosCompra: ComprarIngressoDto = {
        eventoId: 'evento-qr',
        tipoIngressoId: 'tipo-qr',
        quantidade: 1,
        comprador: {
          nome: 'Ana Silva',
          email: 'ana@exemplo.com'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      const ingressoEncontrado = await ModeloIngresso.buscarPorCodigoQr(ingressos[0].codigoQr);

      expect(ingressoEncontrado).toBeTruthy();
      expect(ingressoEncontrado?.codigoQr).toBe(ingressos[0].codigoQr);
      expect(ingressoEncontrado?.nomeComprador).toBe('Ana Silva');
    });

    test('deve retornar null para código QR inexistente', async () => {
      const ingresso = await ModeloIngresso.buscarPorCodigoQr('qr-inexistente');
      expect(ingresso).toBeNull();
    });
  });

  describe('validarIngresso', () => {
    test('deve validar ingresso válido não usado', async () => {
      const dadosCompra: ComprarIngressoDto = {
        eventoId: 'evento-validacao',
        tipoIngressoId: 'tipo-validacao',
        quantidade: 1,
        comprador: {
          nome: 'Carlos Oliveira',
          email: 'carlos@exemplo.com'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      const resultado = await ModeloIngresso.validarIngresso(ingressos[0].codigoQr);

      expect(resultado.valido).toBe(true);
      expect(resultado.ingresso).toBeTruthy();
      expect(resultado.ingresso?.id).toBe(ingressos[0].id);
      expect(resultado.motivo).toBeUndefined();
    });

    test('deve rejeitar ingresso inexistente', async () => {
      const resultado = await ModeloIngresso.validarIngresso('qr-inexistente');

      expect(resultado.valido).toBe(false);
      expect(resultado.ingresso).toBeUndefined();
      expect(resultado.motivo).toBe('Ingresso não encontrado');
    });

    test('deve rejeitar ingresso já usado', async () => {
      const dadosCompra: ComprarIngressoDto = {
        eventoId: 'evento-usado',
        tipoIngressoId: 'tipo-usado',
        quantidade: 1,
        comprador: {
          nome: 'Lucas Pereira',
          email: 'lucas@exemplo.com'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      // Marcar como usado
      await ModeloIngresso.marcarComoUsado(ingressos[0].id);

      const resultado = await ModeloIngresso.validarIngresso(ingressos[0].codigoQr);

      expect(resultado.valido).toBe(false);
      expect(resultado.ingresso).toBeTruthy();
      expect(resultado.motivo).toBe('Ingresso já foi usado');
    });
  });

  describe('marcarComoUsado', () => {
    test('deve marcar ingresso como usado', async () => {
      const dadosCompra: ComprarIngressoDto = {
        eventoId: 'evento-uso',
        tipoIngressoId: 'tipo-uso',
        quantidade: 1,
        comprador: {
          nome: 'Fernanda Lima',
          email: 'fernanda@exemplo.com'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      const sucesso = await ModeloIngresso.marcarComoUsado(ingressos[0].id);
      const ingressoAtualizado = await ModeloIngresso.buscarPorId(ingressos[0].id);

      expect(sucesso).toBe(true);
      expect(ingressoAtualizado?.usado).toBe(true);
      expect(ingressoAtualizado?.dataUso).toBeInstanceOf(Date);
    });

    test('deve retornar false para ID inexistente', async () => {
      const sucesso = await ModeloIngresso.marcarComoUsado('id-inexistente');
      expect(sucesso).toBe(false);
    });
  });

  describe('buscarPorEvento', () => {
    test('deve buscar ingressos por evento', async () => {
      const eventoId = 'evento-busca';
      
      const dadosCompra1: ComprarIngressoDto = {
        eventoId,
        tipoIngressoId: 'tipo-1',
        quantidade: 2,
        comprador: {
          nome: 'Comprador 1',
          email: 'comprador1@exemplo.com'
        }
      };

      const dadosCompra2: ComprarIngressoDto = {
        eventoId: 'outro-evento',
        tipoIngressoId: 'tipo-2',
        quantidade: 1,
        comprador: {
          nome: 'Comprador 2',
          email: 'comprador2@exemplo.com'
        }
      };

      await ModeloIngresso.criarIngresso(dadosCompra1, dadosCompra1.tipoIngressoId, dadosCompra1.eventoId);
      await ModeloIngresso.criarIngresso(dadosCompra2, dadosCompra2.tipoIngressoId, dadosCompra2.eventoId);

      const ingressosDoEvento = await ModeloIngresso.buscarPorEvento(eventoId);

      expect(ingressosDoEvento).toHaveLength(2);
      expect(ingressosDoEvento[0].eventoId).toBe(eventoId);
      expect(ingressosDoEvento[1].eventoId).toBe(eventoId);
    });
  });

  describe('contarIngressos', () => {
    test('deve contar ingressos vendidos e usados', async () => {
      const eventoId = 'evento-contagem';
      
      const dadosCompra: ComprarIngressoDto = {
        eventoId,
        tipoIngressoId: 'tipo-contagem',
        quantidade: 3,
        comprador: {
          nome: 'Comprador Teste',
          email: 'teste@exemplo.com'
        }
      };

      const ingressos = await ModeloIngresso.criarIngresso(
        dadosCompra,
        dadosCompra.tipoIngressoId,
        dadosCompra.eventoId
      );

      // Marcar 2 ingressos como usados
      await ModeloIngresso.marcarComoUsado(ingressos[0].id);
      await ModeloIngresso.marcarComoUsado(ingressos[1].id);

      const totalVendidos = await ModeloIngresso.contarIngressosVendidos(eventoId);
      const totalUsados = await ModeloIngresso.contarIngressosUsados(eventoId);

      expect(totalVendidos).toBe(3);
      expect(totalUsados).toBe(2);
    });
  });

  describe('gerarCodigoQr', () => {
    test('deve gerar códigos QR únicos', () => {
      const codigo1 = ModeloIngresso.gerarCodigoQr('ingresso-1', 'evento-1');
      const codigo2 = ModeloIngresso.gerarCodigoQr('ingresso-2', 'evento-1');
      const codigo3 = ModeloIngresso.gerarCodigoQr('ingresso-1', 'evento-2');

      expect(codigo1).not.toBe(codigo2);
      expect(codigo1).not.toBe(codigo3);
      expect(codigo2).not.toBe(codigo3);
      expect(codigo1).toBeDefined();
      expect(codigo1.length).toBeGreaterThan(0);
    });
  });

  describe('gerarHashSeguranca', () => {
    test('deve gerar hashes de segurança consistentes', () => {
      const codigoQr = 'codigo-teste';
      const hash1 = ModeloIngresso.gerarHashSeguranca(codigoQr);
      const hash2 = ModeloIngresso.gerarHashSeguranca(codigoQr);

      expect(hash1).toBe(hash2); // Hash deve ser consistente para o mesmo input
      expect(hash1).toBeDefined();
      expect(hash1.length).toBe(64); // SHA256 produz hash de 64 caracteres em hex
    });

    test('deve gerar hashes diferentes para códigos QR diferentes', () => {
      const hash1 = ModeloIngresso.gerarHashSeguranca('codigo-1');
      const hash2 = ModeloIngresso.gerarHashSeguranca('codigo-2');

      expect(hash1).not.toBe(hash2);
    });
  });
});
