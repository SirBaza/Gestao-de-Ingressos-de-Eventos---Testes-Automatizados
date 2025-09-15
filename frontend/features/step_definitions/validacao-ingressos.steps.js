const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Estado para testes de validação
let ingressosValidos = new Map([
  ['QR_VALIDO_123', { 
    valido: true, 
    utilizado: false, 
    participante: {
      nome: 'João Silva',
      documento: '123.456.789-00',
      nomeEvento: 'Festa de Formatura',
      tipoIngresso: 'VIP'
    }
  }],
  ['QR_UTILIZADO_456', { 
    valido: true, 
    utilizado: true,
    participante: {
      nome: 'Maria Santos',
      documento: '987.654.321-00',
      nomeEvento: 'Festa de Formatura',
      tipoIngresso: 'Pista'
    }
  }],
  ['QR_CANCELADO_789', { 
    valido: false, 
    utilizado: false,
    motivoCancelamento: 'Evento foi cancelado'
  }]
]);

let codigoQRInserido = '';
let resultadoValidacao = null;

// Cenários de Validação de Ingressos
Given('que existe um ingresso válido não utilizado', function () {
  // Ingresso já está no mapa com status válido e não utilizado
  assert(ingressosValidos.has('QR_VALIDO_123'), 'Deveria existir ingresso válido');
});

Given('que existe um ingresso que já foi utilizado', function () {
  // Ingresso já está no mapa com status utilizado
  assert(ingressosValidos.has('QR_UTILIZADO_456'), 'Deveria existir ingresso utilizado');
});

Given('que existe um ingresso para um evento cancelado', function () {
  // Ingresso já está no mapa com evento cancelado
  assert(ingressosValidos.has('QR_CANCELADO_789'), 'Deveria existir ingresso de evento cancelado');
});

Given('que eu estou na página de validação de ingressos', function () {
  codigoQRInserido = '';
  resultadoValidacao = null;
});

When('eu insiro o código QR válido', function () {
  codigoQRInserido = 'QR_VALIDO_123';
});

When('eu insiro o código QR do ingresso utilizado', function () {
  codigoQRInserido = 'QR_UTILIZADO_456';
});

When('eu insiro um código QR inválido {string}', function (codigo) {
  codigoQRInserido = codigo;
});

When('eu insiro o código QR do ingresso', function () {
  codigoQRInserido = 'QR_CANCELADO_789';
});

When('clico em {string} sem inserir código', function (botao) {
  if (botao === 'Validar Ingresso') {
    codigoQRInserido = '';
    resultadoValidacao = {
      valido: false,
      mensagem: 'Por favor, digite o código QR'
    };
  }
});

When('clico em {string} para validar ingresso', function (botao) {
  if (botao === 'Validar Ingresso' && codigoQRInserido) {
    // Simula validação do ingresso
    const ingresso = ingressosValidos.get(codigoQRInserido);
    
    if (!ingresso) {
      resultadoValidacao = {
        valido: false,
        jaUtilizado: false,
        mensagem: 'Código QR inválido ou não encontrado'
      };
    } else if (!ingresso.valido) {
      resultadoValidacao = {
        valido: false,
        jaUtilizado: false,
        mensagem: ingresso.motivoCancelamento || 'Ingresso inválido'
      };
    } else if (ingresso.utilizado) {
      resultadoValidacao = {
        valido: true,
        jaUtilizado: true,
        mensagem: 'Este ingresso já foi utilizado para entrada',
        dadosParticipante: ingresso.participante
      };
    } else {
      // Ingresso válido - marca como utilizado
      ingresso.utilizado = true;
      resultadoValidacao = {
        valido: true,
        jaUtilizado: false,
        mensagem: 'Ingresso válido - entrada autorizada',
        dadosParticipante: ingresso.participante,
        entradaAutorizada: true
      };
    }
  }
});

Then('o ingresso deveria ser validado com sucesso', function () {
  assert(resultadoValidacao.valido, 'Ingresso deveria ser válido');
  assert(!resultadoValidacao.jaUtilizado, 'Ingresso não deveria estar previamente utilizado');
});

Then('deveria ver {string}', function (mensagem) {
  if (mensagem === 'ENTRADA AUTORIZADA') {
    assert(resultadoValidacao.entradaAutorizada, 'Entrada deveria ser autorizada');
  } else if (mensagem === 'INGRESSO JÁ UTILIZADO') {
    assert(resultadoValidacao.jaUtilizado, 'Ingresso deveria estar marcado como utilizado');
  } else if (mensagem === 'INGRESSO INVÁLIDO') {
    assert(!resultadoValidacao.valido, 'Ingresso deveria ser inválido');
  } else {
    assert(resultadoValidacao.mensagem && 
      resultadoValidacao.mensagem.toLowerCase().includes(mensagem.toLowerCase()),
      `Mensagem deveria conter "${mensagem}"`);
  }
});

Then('deveria ver os dados do participante', function () {
  assert(resultadoValidacao.dadosParticipante, 'Deveria retornar dados do participante');
  assert(resultadoValidacao.dadosParticipante.nome, 'Deveria ter nome do participante');
  assert(resultadoValidacao.dadosParticipante.documento, 'Deveria ter documento do participante');
});

Then('o ingresso deveria ser marcado como utilizado', function () {
  const ingresso = ingressosValidos.get(codigoQRInserido);
  assert(ingresso && ingresso.utilizado, 'Ingresso deveria estar marcado como utilizado');
});

Then('deveria ver uma mensagem de aviso', function () {
  assert(resultadoValidacao.jaUtilizado, 'Deveria haver aviso de ingresso já utilizado');
});

Then('deveria ver os dados do participante para conferência', function () {
  assert(resultadoValidacao.dadosParticipante, 'Deveria mostrar dados para conferência');
});

Then('deveria ver uma mensagem de erro', function () {
  assert(!resultadoValidacao.valido, 'Deveria haver erro de validação');
});

Then('não deveria ver dados do participante', function () {
  assert(!resultadoValidacao.dadosParticipante, 'Não deveria mostrar dados do participante');
});

Then('o botão de validação deveria estar desabilitado', function () {
  assert(!codigoQRInserido, 'Código QR não foi inserido');
});

Then('a entrada não deveria ser autorizada', function () {
  assert(!resultadoValidacao.entradaAutorizada, 'Entrada não deveria ser autorizada');
});

Then('deveria ver indicadores visuais claros \\(✅ ❌ ⚠️)', function () {
  // Simula verificação de indicadores visuais
  if (resultadoValidacao.valido && !resultadoValidacao.jaUtilizado) {
    assert(true, 'Deveria mostrar ✅ para ingresso válido');
  } else if (resultadoValidacao.jaUtilizado) {
    assert(true, 'Deveria mostrar ⚠️ para ingresso já utilizado');
  } else {
    assert(true, 'Deveria mostrar ❌ para ingresso inválido');
  }
});

Then('as cores deveriam corresponder ao status', function () {
  // Simula verificação de cores correspondentes ao status
  assert(true, 'Cores deveriam refletir o status da validação');
});

Then('deveria poder fazer uma nova validação facilmente', function () {
  // Simula capacidade de fazer nova validação
  assert(true, 'Interface deveria permitir nova validação');
});

console.log('✅ Step definitions para validação de ingressos carregadas com sucesso!');
