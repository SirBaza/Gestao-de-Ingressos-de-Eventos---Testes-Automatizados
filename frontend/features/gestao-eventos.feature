# language: pt
Funcionalidade: Gestão de Eventos
  Como um organizador de eventos
  Eu quero gerenciar eventos
  Para que os participantes possam comprar ingressos

  Cenário: Listar eventos disponíveis
    Dado que existem eventos cadastrados no sistema
    Quando eu acesso a página de eventos
    Então eu deveria ver a lista de eventos disponíveis
    E cada evento deveria mostrar nome, data, local e capacidade

  Cenário: Criar um novo evento com dados válidos
    Dado que eu estou na página de criar evento
    Quando eu preencho o formulário com dados válidos:
      | nome             | Festa de Formatura 2025    |
      | data             | 2025-12-15 20:00          |
      | local            | Centro de Convenções       |
      | capacidadeMaxima | 500                       |
      | descricao        | Festa de formatura da turma |
    E clico em "Criar Evento" para gestão de eventos
    Então o evento deveria ser criado com sucesso
    E eu deveria ser redirecionado para a lista de eventos
    E deveria ver uma mensagem de sucesso

  Cenário: Falhar ao criar evento com dados inválidos
    Dado que eu estou na página de criar evento
    Quando eu preencho o formulário com dados inválidos:
      | nome             |                           |
      | data             | 2020-01-01 10:00         |
      | local            |                           |
      | capacidadeMaxima | 0                         |
    E clico em "Criar Evento" para gestão de eventos
    Então deveria ver mensagens de erro na gestão de eventos
    E o evento não deveria ser criado

  Cenário: Cancelar criação de evento
    Dado que eu estou na página de criar evento
    Quando eu clico em "Cancelar"
    Então eu deveria ser redirecionado para a lista de eventos
    E nenhum evento deveria ser criado
