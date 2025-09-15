# language: pt
Funcionalidade: Compra de Ingressos Simplificada
  Como participante
  Eu quero comprar ingressos
  Para que eu possa participar de eventos

  Cenário: Comprar ingresso com sucesso
    Dado que existe um evento disponível para compra
    E eu estou na página de compra do evento
    Quando eu preencho dados válidos do participante
    E clico em "Comprar Ingresso" para comprar ingresso
    Então a compra deveria ser processada com sucesso
    E eu deveria ver o código QR do ingresso

  Cenário: Falhar na compra com dados inválidos
    Dado que existe um evento disponível para compra
    E eu estou na página de compra do evento
    Quando eu preencho dados inválidos do participante
    E clico em "Comprar Ingresso" para comprar ingresso
    Então deveria ver mensagens de erro na compra
    E a compra não deveria ser processada
