# language: pt
Funcionalidade: Validação de Ingressos
  Como um organizador do evento
  Eu quero validar ingressos na entrada
  Para garantir que apenas participantes com ingressos válidos entrem

  Cenário: Validar ingresso válido pela primeira vez
    Dado que existe um ingresso válido não utilizado
    E eu estou na página de validação de ingressos
    Quando eu insiro o código QR válido
    E clico em "Validar Ingresso"
    Então o ingresso deveria ser validado com sucesso
    E deveria ver "ENTRADA AUTORIZADA"
    E deveria ver os dados do participante
    E o ingresso deveria ser marcado como utilizado

  Cenário: Tentar validar ingresso já utilizado
    Dado que existe um ingresso que já foi utilizado
    E eu estou na página de validação de ingressos
    Quando eu insiro o código QR do ingresso utilizado
    E clico em "Validar Ingresso"
    Então deveria ver "INGRESSO JÁ UTILIZADO"
    E deveria ver uma mensagem de aviso
    E deveria ver os dados do participante para conferência

  Cenário: Tentar validar código QR inválido
    Dado que eu estou na página de validação de ingressos
    Quando eu insiro um código QR inválido "QR_FALSO_123"
    E clico em "Validar Ingresso"
    Então deveria ver "INGRESSO INVÁLIDO"
    E deveria ver uma mensagem de erro
    E não deveria ver dados do participante

  Cenário: Tentar validar sem inserir código
    Dado que eu estou na página de validação de ingressos
    Quando eu clico em "Validar Ingresso" sem inserir código
    Então deveria ver uma mensagem "Por favor, digite o código QR"
    E o botão de validação deveria estar desabilitado

  Cenário: Validar ingresso para evento cancelado
    Dado que existe um ingresso para um evento cancelado
    E eu estou na página de validação de ingressos
    Quando eu insiro o código QR do ingresso
    E clico em "Validar Ingresso"
    Então deveria ver "INGRESSO INVÁLIDO"
    E deveria ver "Evento foi cancelado"
    E a entrada não deveria ser autorizada

  Cenário: Interface de validação responsiva
    Dado que eu estou na página de validação de ingressos
    Quando eu realizo uma validação
    Então deveria ver indicadores visuais claros (✅ ❌ ⚠️)
    E as cores deveriam corresponder ao status
    E deveria poder fazer uma nova validação facilmente
