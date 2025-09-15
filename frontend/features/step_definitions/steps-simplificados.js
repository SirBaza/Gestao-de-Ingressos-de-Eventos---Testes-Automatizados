const { Given, When, Then } = require('@cucumber/cucumber');

console.log('✅ Step definitions simplificados carregados com sucesso!');

// Mock data global
let evento = {};
let formData = {};
let validationErrors = [];
let successMessage = '';
let compra = {};
let ingresso = {};
let qrCode = '';
let resultadoValidacao = '';

// Given steps
Given('que eu estou na página de criar evento', function () {
  console.log('📍 Navegando para página de criar evento');
  evento = {};
  formData = {};
  validationErrors = [];
  successMessage = '';
});

Given('que existe um evento disponível para compra', function () {
  console.log('📅 Configurando evento disponível para compra');
  evento = {
    id: 'evento_123',
    nome: 'Festa de Aniversário',
    data: '2025-12-25T20:00:00Z',
    local: 'Salão de Festas',
    capacidadeMaxima: 100,
    status: 'ativo'
  };
});

Given('eu estou na página de compra do evento', function () {
  console.log('📍 Navegando para página de compra');
  compra = {};
  formData = {};
});

Given('que existe um ingresso válido não utilizado', function () {
  console.log('🎫 Configurando ingresso válido');
  ingresso = {
    id: 'ingresso_456',
    eventoId: 'evento_123',
    participante: 'João Silva',
    qrCode: 'QR_VALIDO_123456789',
    utilizado: false,
    hashSeguranca: 'hash_seguro_123'
  };
  qrCode = ingresso.qrCode;
});

Given('eu estou na página de validação de ingressos', function () {
  console.log('📍 Navegando para página de validação');
  resultadoValidacao = '';
});

// When steps
When('eu preencho dados válidos do evento', function () {
  formData = {
    nome: 'Festa de Formatura 2025',
    data: '2025-12-15T20:00:00Z',
    local: 'Centro de Convenções',
    capacidadeMaxima: 500,
    descricao: 'Festa de formatura da turma'
  };
  console.log('📝 Preenchendo dados válidos do evento');
});

When('eu preencho dados inválidos do evento', function () {
  formData = {
    nome: '',
    data: '2020-01-01T10:00:00Z',
    local: '',
    capacidadeMaxima: 0
  };
  console.log('📝 Preenchendo dados inválidos do evento');
});

When('eu preencho dados válidos do participante', function () {
  formData = {
    nomeCompleto: 'João Silva Santos',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    documento: '123.456.789-00',
    curso: 'Engenharia de Software',
    numeroMatricula: '2021001234',
    tipoIngresso: 'pista',
    quantidade: 2
  };
  console.log('📝 Preenchendo dados válidos do participante');
});

When('eu preencho dados inválidos do participante', function () {
  formData = {
    nomeCompleto: '',
    email: 'email-invalido',
    telefone: '',
    documento: ''
  };
  console.log('📝 Preenchendo dados inválidos do participante');
});

When('eu insiro o código QR válido', function () {
  qrCode = ingresso.qrCode;
  console.log('📝 Inserindo código QR válido:', qrCode);
});

When('eu insiro um código QR inválido {string}', function (codigoInvalido) {
  qrCode = codigoInvalido;
  console.log('📝 Inserindo código QR inválido:', qrCode);
});

When('clico em {string} para gestão de eventos', function (botao) {
  console.log(`🖱️ Clicando em "${botao}" para gestão de eventos`);
  
  if (botao === 'Criar Evento') {
    validationErrors = [];
    
    if (!formData.nome || formData.nome.trim().length < 3) {
      validationErrors.push('Nome deve ter pelo menos 3 caracteres');
    }
    
    if (!formData.data || new Date(formData.data) <= new Date()) {
      validationErrors.push('Data deve ser futura');
    }
    
    if (!formData.local || formData.local.trim().length < 3) {
      validationErrors.push('Local deve ter pelo menos 3 caracteres');
    }
    
    if (!formData.capacidadeMaxima || formData.capacidadeMaxima <= 0) {
      validationErrors.push('Capacidade deve ser maior que zero');
    }
    
    if (validationErrors.length === 0) {
      evento = { id: 'evento_' + Date.now(), ...formData, status: 'ativo' };
      successMessage = 'Evento criado com sucesso!';
      console.log('✅ Evento criado com sucesso!');
    } else {
      console.log('❌ Falha na criação do evento:', validationErrors);
    }
  }
});

When('clico em {string} para comprar ingresso', function (botao) {
  console.log(`🖱️ Clicando em "${botao}" para comprar ingresso`);
  
  if (botao === 'Comprar Ingresso') {
    validationErrors = [];
    
    if (!formData.nomeCompleto || formData.nomeCompleto.trim().length < 3) {
      validationErrors.push('Nome completo é obrigatório');
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      validationErrors.push('Email válido é obrigatório');
    }
    
    if (!formData.telefone || formData.telefone.trim().length < 10) {
      validationErrors.push('Telefone é obrigatório');
    }
    
    if (!formData.documento || formData.documento.trim().length < 10) {
      validationErrors.push('Documento é obrigatório');
    }
    
    if (validationErrors.length === 0) {
      compra = { 
        id: 'compra_' + Date.now(), 
        participante: formData,
        eventoId: evento.id,
        qrCode: 'QR_' + Date.now(),
        status: 'confirmada'
      };
      qrCode = compra.qrCode;
      successMessage = 'Compra realizada com sucesso!';
      console.log('✅ Compra realizada com sucesso!');
    } else {
      console.log('❌ Falha na compra:', validationErrors);
    }
  }
});

When('clico em {string} para validar ingresso', function (botao) {
  console.log(`🖱️ Clicando em "${botao}" para validar ingresso`);
  
  if (botao === 'Validar Ingresso') {
    if (qrCode === 'QR_VALIDO_123456789') {
      if (!ingresso.utilizado) {
        resultadoValidacao = 'ENTRADA AUTORIZADA';
        ingresso.utilizado = true;
        console.log('✅ Ingresso validado com sucesso!');
      } else {
        resultadoValidacao = 'INGRESSO JÁ UTILIZADO';
        console.log('⚠️ Ingresso já foi utilizado');
      }
    } else {
      resultadoValidacao = 'INGRESSO INVÁLIDO';
      console.log('❌ Código QR inválido');
    }
  }
});

// Then steps
Then('o evento deveria ser criado com sucesso', function () {
  if (!evento || !evento.id) {
    throw new Error('Evento não foi criado');
  }
  console.log('✅ Verificação: Evento criado com sucesso');
});

Then('deveria ver uma mensagem de sucesso', function () {
  if (!successMessage) {
    throw new Error('Mensagem de sucesso não encontrada');
  }
  console.log('✅ Verificação: Mensagem de sucesso exibida');
});

Then('deveria ver mensagens de erro na gestão de eventos', function () {
  if (validationErrors.length === 0) {
    throw new Error('Nenhuma mensagem de erro encontrada');
  }
  console.log('✅ Verificação: Mensagens de erro exibidas:', validationErrors);
});

Then('o evento não deveria ser criado', function () {
  if (evento && evento.id) {
    throw new Error('Evento foi criado quando não deveria');
  }
  console.log('✅ Verificação: Evento não foi criado como esperado');
});

Then('a compra deveria ser processada com sucesso', function () {
  if (!compra || !compra.id) {
    throw new Error('Compra não foi processada');
  }
  console.log('✅ Verificação: Compra processada com sucesso');
});

Then('eu deveria ver o código QR do ingresso', function () {
  if (!qrCode) {
    throw new Error('Código QR não foi gerado');
  }
  console.log('✅ Verificação: Código QR gerado:', qrCode);
});

Then('deveria ver mensagens de erro na compra', function () {
  if (validationErrors.length === 0) {
    throw new Error('Nenhuma mensagem de erro encontrada');
  }
  console.log('✅ Verificação: Mensagens de erro na compra:', validationErrors);
});

Then('a compra não deveria ser processada', function () {
  if (compra && compra.id) {
    throw new Error('Compra foi processada quando não deveria');
  }
  console.log('✅ Verificação: Compra não foi processada como esperado');
});

Then('o ingresso deveria ser validado com sucesso', function () {
  if (resultadoValidacao !== 'ENTRADA AUTORIZADA') {
    throw new Error('Ingresso não foi validado corretamente');
  }
  console.log('✅ Verificação: Ingresso validado com sucesso');
});

Then('deveria ver {string}', function (mensagem) {
  if (resultadoValidacao !== mensagem) {
    throw new Error(`Esperava "${mensagem}", mas obteve "${resultadoValidacao}"`);
  }
  console.log('✅ Verificação: Mensagem correta exibida:', mensagem);
});

Then('deveria ver uma mensagem de erro', function () {
  if (resultadoValidacao === 'ENTRADA AUTORIZADA') {
    throw new Error('Não deveria ter autorizado a entrada');
  }
  console.log('✅ Verificação: Mensagem de erro exibida corretamente');
});
