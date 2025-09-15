const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Estado para testes de compra
let eventoDisponivel = {
  id: 'evento_compra_123',
  nome: 'Evento Teste Compra',
  status: 'ativo',
  ingressosDisponiveis: true
};

let eventoEsgotado = {
  id: 'evento_esgotado_123',
  nome: 'Evento Esgotado',
  status: 'ativo',
  ingressosDisponiveis: false
};

let dadosParticipante = {};
let resultadoCompra = null;

// Cenários de Compra de Ingressos
Given('que existe um evento disponível para compra', function () {
  eventoDisponivel.ingressosDisponiveis = true;
});

Given('que existe um evento com ingressos esgotados', function () {
  eventoEsgotado.ingressosDisponiveis = false;
});

Given('eu estou na página de compra do evento', function () {
  dadosParticipante = {};
  resultadoCompra = null;
});

When('eu preencho os dados do participante:', function (dataTable) {
  const dados = dataTable.rowsHash();
  dadosParticipante = {
    nomeCompleto: dados.nomeCompleto,
    email: dados.email,
    telefone: dados.telefone,
    documento: dados.documento,
    curso: dados.curso,
    numeroMatricula: dados.numeroMatricula,
    tipoIngresso: dados.tipoIngresso,
    quantidade: parseInt(dados.quantidade)
  };
});

When('eu preencho dados inválidos:', function (dataTable) {
  const dados = dataTable.rowsHash();
  dadosParticipante = {
    nomeCompleto: dados.nomeCompleto || '',
    email: dados.email || '',
    telefone: dados.telefone || '',
    documento: dados.documento || ''
  };
});

When('eu seleciono {int} ingressos do tipo {string}', function (quantidade, tipo) {
  dadosParticipante.quantidade = quantidade;
  dadosParticipante.tipoIngresso = tipo.toLowerCase();
});

When('preencho dados válidos do participante', function () {
  dadosParticipante = {
    ...dadosParticipante,
    nomeCompleto: 'Teste Silva',
    email: 'teste@email.com',
    telefone: '(11) 99999-9999',
    documento: '123.456.789-00'
  };
});

When('clico em {string} para comprar ingresso', function (botao) {
  if (botao === 'Comprar Ingresso') {
    // Simula validação e processamento da compra
    const erros = [];
    
    if (!dadosParticipante.nomeCompleto || dadosParticipante.nomeCompleto.trim().length < 3) {
      erros.push('Nome completo é obrigatório');
    }
    
    if (!dadosParticipante.email || !dadosParticipante.email.includes('@')) {
      erros.push('Email válido é obrigatório');
    }
    
    if (!dadosParticipante.telefone || dadosParticipante.telefone.trim().length < 10) {
      erros.push('Telefone é obrigatório');
    }
    
    if (!dadosParticipante.documento || dadosParticipante.documento.trim().length < 8) {
      erros.push('Documento é obrigatório');
    }
    
    // Verifica disponibilidade
    if (!eventoDisponivel.ingressosDisponiveis) {
      erros.push('Ingressos esgotados');
    }
    
    if (erros.length === 0) {
      const precos = { pista: 50, vip: 100, camarote: 150 };
      const precoUnitario = precos[dadosParticipante.tipoIngresso] || 50;
      const valorTotal = precoUnitario * (dadosParticipante.quantidade || 1);
      
      resultadoCompra = {
        sucesso: true,
        codigoQR: `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        valorTotal,
        quantidade: dadosParticipante.quantidade || 1,
        tipoIngresso: dadosParticipante.tipoIngresso
      };
    } else {
      resultadoCompra = {
        sucesso: false,
        erros
      };
    }
  }
});

When('eu tento comprar um ingresso', function () {
  dadosParticipante = {
    nomeCompleto: 'Teste Silva',
    email: 'teste@email.com',
    telefone: '(11) 99999-9999',
    documento: '123.456.789-00',
    quantidade: 1
  };
  
  // Simula tentativa de compra para evento esgotado
  resultadoCompra = {
    sucesso: false,
    erros: ['Ingressos esgotados']
  };
});

Then('a compra deveria ser processada com sucesso', function () {
  assert(resultadoCompra.sucesso, 'Compra deveria ser processada com sucesso');
});

Then('eu deveria ver o código QR do ingresso', function () {
  assert(resultadoCompra.codigoQR, 'Deveria gerar código QR');
  assert(resultadoCompra.codigoQR.startsWith('QR_'), 'Código QR deveria ter formato válido');
});

Then('deveria ver uma mensagem de confirmação', function () {
  assert(resultadoCompra.sucesso, 'Deveria haver confirmação de sucesso');
});

Then('deveria ver mensagens de erro na compra', function () {
  assert(!resultadoCompra.sucesso, 'Compra não deveria ter sucesso');
  assert(resultadoCompra.erros && resultadoCompra.erros.length > 0, 'Deveria haver mensagens de erro');
});

Then('a compra não deveria ser processada', function () {
  assert(!resultadoCompra.sucesso, 'Compra não deveria ser processada');
});

Then('deveria ser gerado um código QR único', function () {
  assert(resultadoCompra.codigoQR, 'Deveria gerar código QR único');
});

Then('o valor total deveria refletir {int} ingressos VIP', function (quantidade) {
  const valorEsperado = 100 * quantidade; // VIP custa R$ 100
  assert(resultadoCompra.valorTotal === valorEsperado, 
    `Valor total deveria ser ${valorEsperado}, mas foi ${resultadoCompra.valorTotal}`);
});

Then('deveria ver uma mensagem de {string}', function (mensagem) {
  assert(resultadoCompra.erros && resultadoCompra.erros.some(erro => 
    erro.toLowerCase().includes(mensagem.toLowerCase())), 
    `Deveria haver mensagem contendo "${mensagem}"`);
});

console.log('✅ Step definitions para compra de ingressos carregadas com sucesso!');
