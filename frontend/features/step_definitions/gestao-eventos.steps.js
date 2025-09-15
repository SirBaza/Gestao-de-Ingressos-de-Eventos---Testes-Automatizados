const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// Simulação de dados e estado da aplicação para testes
let eventosMock = [
  {
    id: 'evento_123',
    nome: 'Festa de Aniversário',
    data: '2025-12-25T20:00:00Z',
    local: 'Salão de Festas',
    capacidadeMaxima: 100,
    status: 'ativo'
  }
];

let formData = {};
let resultadoOperacao = null;
let mensagensErro = [];

// Cenários de Gestão de Eventos
Given('que existem eventos cadastrados no sistema', function () {
  // Eventos já estão no mock
  assert(eventosMock.length > 0, 'Deveria haver eventos no sistema');
});

Given('que eu estou na página de criar evento', function () {
  // Simula navegação para página de criar evento
  formData = {};
  mensagensErro = [];
});

When('eu acesso a página de eventos', function () {
  // Simula carregamento da lista de eventos
  resultadoOperacao = { eventos: eventosMock };
});

When('eu preencho o formulário com dados válidos:', function (dataTable) {
  const dados = dataTable.rowsHash();
  formData = {
    nome: dados.nome,
    data: dados.data,
    local: dados.local,
    capacidadeMaxima: parseInt(dados.capacidadeMaxima),
    descricao: dados.descricao
  };
});

When('eu preencho o formulário com dados inválidos:', function (dataTable) {
  const dados = dataTable.rowsHash();
  formData = {
    nome: dados.nome || '',
    data: dados.data || '',
    local: dados.local || '',
    capacidadeMaxima: parseInt(dados.capacidadeMaxima) || 0,
    descricao: dados.descricao || ''
  };
});

When('clico em {string} para gestão de eventos', function (botao) {
  if (botao === 'Criar Evento') {
    // Simula validação e criação do evento
    mensagensErro = [];
    
    if (!formData.nome || formData.nome.trim().length < 3) {
      mensagensErro.push('Nome deve ter pelo menos 3 caracteres');
    }
    
    if (!formData.data || new Date(formData.data) <= new Date()) {
      mensagensErro.push('Data deve ser futura');
    }
    
    if (!formData.local || formData.local.trim().length < 3) {
      mensagensErro.push('Local deve ter pelo menos 3 caracteres');
    }
    
    if (!formData.capacidadeMaxima || formData.capacidadeMaxima <= 0) {
      mensagensErro.push('Capacidade deve ser maior que zero');
    }
    
    if (mensagensErro.length === 0) {
      const novoEvento = {
        id: 'evento_' + Date.now(),
        ...formData,
        status: 'ativo'
      };
      eventosMock.push(novoEvento);
      resultadoOperacao = { sucesso: true, evento: novoEvento };
    } else {
      resultadoOperacao = { sucesso: false, erros: mensagensErro };
    }
  } else if (botao === 'Cancelar') {
    resultadoOperacao = { cancelado: true };
  }
});

Then('eu deveria ver a lista de eventos disponíveis', function () {
  assert(resultadoOperacao.eventos, 'Deveria retornar lista de eventos');
  assert(resultadoOperacao.eventos.length > 0, 'Lista não deveria estar vazia');
});

Then('cada evento deveria mostrar nome, data, local e capacidade', function () {
  const evento = resultadoOperacao.eventos[0];
  assert(evento.nome, 'Evento deveria ter nome');
  assert(evento.data, 'Evento deveria ter data');
  assert(evento.local, 'Evento deveria ter local');
  assert(evento.capacidadeMaxima, 'Evento deveria ter capacidade');
});

Then('o evento deveria ser criado com sucesso', function () {
  assert(resultadoOperacao.sucesso, 'Evento deveria ser criado com sucesso');
  assert(resultadoOperacao.evento, 'Deveria retornar o evento criado');
});

Then('eu deveria ser redirecionado para a lista de eventos', function () {
  // Simula redirecionamento
  assert(resultadoOperacao.sucesso || resultadoOperacao.cancelado, 'Deveria haver redirecionamento');
});

Then('deveria ver uma mensagem de sucesso', function () {
  assert(resultadoOperacao.sucesso, 'Deveria haver mensagem de sucesso');
});

Then('deveria ver mensagens de erro na gestão de eventos', function () {
  assert(!resultadoOperacao.sucesso, 'Operação não deveria ter sucesso');
  assert(resultadoOperacao.erros && resultadoOperacao.erros.length > 0, 'Deveria haver mensagens de erro');
});

Then('o evento não deveria ser criado', function () {
  assert(!resultadoOperacao.sucesso, 'Evento não deveria ser criado');
});

Then('nenhum evento deveria ser criado', function () {
  assert(resultadoOperacao.cancelado, 'Operação foi cancelada');
});

console.log('✅ Step definitions para gestão de eventos carregadas com sucesso!');
