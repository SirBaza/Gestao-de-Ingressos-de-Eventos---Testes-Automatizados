import { Evento } from '../../../src/domain/entities/evento';
import { TestRunner, assert, assertEqual, assertThrows } from '../../../src/main/test-runner';

const testRunner = new TestRunner();

// Testes da entidade Evento
testRunner.adicionarTeste('Evento - Deve criar evento válido', () => {
  const evento = new Evento({
    nome: 'Festa de Aniversário',
    data: new Date('2025-12-25'),
    local: 'Salão de Festas',
    capacidadeMaxima: 100,
    organizadorId: 'org_123'
  });

  assertEqual(evento.nome, 'Festa de Aniversário');
  assertEqual(evento.local, 'Salão de Festas');
  assertEqual(evento.capacidadeMaxima, 100);
  assert(evento.id.startsWith('evento_'));
});

testRunner.adicionarTeste('Evento - Deve falhar com nome inválido', () => {
  assertThrows(() => {
    new Evento({
      nome: 'AB', // Muito curto
      data: new Date('2025-12-25'),
      local: 'Salão de Festas',
      capacidadeMaxima: 100,
      organizadorId: 'org_123'
    });
  }, 'Deveria falhar com nome muito curto');
});

testRunner.adicionarTeste('Evento - Deve falhar com data passada', () => {
  assertThrows(() => {
    new Evento({
      nome: 'Evento Teste',
      data: new Date('2020-01-01'), // Data passada
      local: 'Salão de Festas',
      capacidadeMaxima: 100,
      organizadorId: 'org_123'
    });
  }, 'Deveria falhar com data passada');
});

testRunner.adicionarTeste('Evento - Deve falhar com capacidade inválida', () => {
  assertThrows(() => {
    new Evento({
      nome: 'Evento Teste',
      data: new Date('2025-12-25'),
      local: 'Salão de Festas',
      capacidadeMaxima: 0, // Capacidade inválida
      organizadorId: 'org_123'
    });
  }, 'Deveria falhar com capacidade zero');
});

testRunner.adicionarTeste('Evento - Deve atualizar dados corretamente', () => {
  const evento = new Evento({
    nome: 'Evento Original',
    data: new Date('2025-12-25'),
    local: 'Local Original',
    capacidadeMaxima: 100,
    organizadorId: 'org_123'
  });

  evento.atualizarEvento({
    nome: 'Evento Atualizado',
    capacidadeMaxima: 200
  });

  assertEqual(evento.nome, 'Evento Atualizado');
  assertEqual(evento.capacidadeMaxima, 200);
  assertEqual(evento.local, 'Local Original'); // Não deve ter mudado
});

testRunner.adicionarTeste('Evento - Deve cancelar evento', () => {
  const evento = new Evento({
    nome: 'Evento Teste',
    data: new Date('2025-12-25'),
    local: 'Salão de Festas',
    capacidadeMaxima: 100,
    organizadorId: 'org_123'
  });

  evento.cancelarEvento();
  assertEqual(evento.status, 'cancelado');
});

testRunner.adicionarTeste('Evento - Deve finalizar evento', () => {
  const evento = new Evento({
    nome: 'Evento Teste',
    data: new Date('2025-12-25'),
    local: 'Salão de Festas',
    capacidadeMaxima: 100,
    organizadorId: 'org_123'
  });

  evento.finalizarEvento();
  assertEqual(evento.status, 'finalizado');
});

// Executar todos os testes
testRunner.executarTodos();
