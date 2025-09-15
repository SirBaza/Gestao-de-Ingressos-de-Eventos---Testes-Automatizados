# language: pt
Funcionalidade: Validação de Ingressos Simplificada
  Como funcionário do evento
  Eu quero validar ingressos
  Para que eu possa controlar a entrada de participantes

  Cenário: Validar ingresso válido
    Dado que existe um ingresso válido não utilizado
    E eu estou na página de validação de ingressos
    Quando eu insiro o código QR válido
    E clico em "Validar Ingresso" para validar ingresso
    Então o ingresso deveria ser validado com sucesso
    E deveria ver "ENTRADA AUTORIZADA"

  Cenário: Tentar validar código QR inválido
    Dado que eu estou na página de validação de ingressos
    Quando eu insiro um código QR inválido "QR_FALSO_123"
    E clico em "Validar Ingresso" para validar ingresso
    Então deveria ver "INGRESSO INVÁLIDO"
    E deveria ver uma mensagem de erro
