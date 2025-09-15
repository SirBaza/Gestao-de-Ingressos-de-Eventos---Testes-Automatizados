# language: pt
Funcionalidade: Gestão de Eventos Simplificada
  Como organizador de eventos
  Eu quero gerenciar eventos
  Para que eu possa criar e administrar eventos

  Cenário: Criar evento com sucesso
    Dado que eu estou na página de criar evento
    Quando eu preencho dados válidos do evento
    E clico em "Criar Evento" para gestão de eventos
    Então o evento deveria ser criado com sucesso
    E deveria ver uma mensagem de sucesso

  Cenário: Falhar na criação com dados inválidos
    Dado que eu estou na página de criar evento
    Quando eu preencho dados inválidos do evento
    E clico em "Criar Evento" para gestão de eventos
    Então deveria ver mensagens de erro na gestão de eventos
    E o evento não deveria ser criado
