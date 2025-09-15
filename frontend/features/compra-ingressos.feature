# language: pt
Funcionalidade: Compra de Ingressos
  Como um participante
  Eu quero comprar ingressos para eventos
  Para que eu possa participar dos eventos

  Cenário: Comprar ingresso com dados válidos
    Dado que existe um evento disponível para compra
    E eu estou na página de compra do evento
    Quando eu preencho os dados do participante:
      | nomeCompleto     | João Silva Santos         |
      | email            | joao@email.com            |
      | telefone         | (11) 99999-9999          |
      | documento        | 123.456.789-00           |
      | curso            | Engenharia de Software    |
      | numeroMatricula  | 2021001234               |
      | tipoIngresso     | pista                    |
      | quantidade       | 2                        |
    E clico em "Comprar Ingresso"
    Então a compra deveria ser processada com sucesso
    E eu deveria ver o código QR do ingresso
    E deveria ver uma mensagem de confirmação

  Cenário: Falhar na compra com dados inválidos
    Dado que existe um evento disponível para compra
    E eu estou na página de compra do evento
    Quando eu preencho dados inválidos:
      | nomeCompleto     |                          |
      | email            | email-invalido           |
      | telefone         |                          |
      | documento        |                          |
    E clico em "Comprar Ingresso"
    Então deveria ver mensagens de erro
    E a compra não deveria ser processada

  Cenário: Comprar multiple ingressos
    Dado que existe um evento disponível para compra
    E eu estou na página de compra do evento
    Quando eu seleciono 3 ingressos do tipo "VIP"
    E preencho dados válidos do participante
    E clico em "Comprar Ingresso"
    Então deveria ser gerado um código QR único
    E o valor total deveria refletir 3 ingressos VIP

  Cenário: Tentar comprar ingresso para evento esgotado
    Dado que existe um evento com ingressos esgotados
    E eu estou na página de compra do evento
    Quando eu tento comprar um ingresso
    Então deveria ver uma mensagem de "ingressos esgotados"
    E a compra não deveria ser processada
