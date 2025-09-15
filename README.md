# Sistema de Gestão de Ingressos de Eventos

Este é um sistema completo de gestão de ingressos de eventos desenvolvido em TypeScript, com backend Node.js/Express e frontend React. O sistema permite criar eventos, vender ingressos e validar entradas usando códigos QR.

## 🚀 Funcionalidades

### Módulo de Gestão de Eventos (Backend e Frontend)
- ✅ Cadastro de eventos com informações completas
- ✅ Listagem de eventos disponíveis
- ✅ Definição de tipos de ingressos (VIP, Pista, Camarote)
- ✅ Controle de capacidade máxima

### Módulo de Venda de Ingressos (Frontend e Backend)
- ✅ Visualização de eventos disponíveis
- ✅ Processo de compra com dados do participante
- ✅ Geração de código QR para cada ingresso
- ✅ Validação de dados obrigatórios

### Módulo de Validação de Entrada (Frontend e Backend)
- ✅ Leitura de código QR para validação
- ✅ Verificação de autenticidade do ingresso
- ✅ Validação de hash de segurança
- ✅ Controle de uso único (evita reutilização)
- ✅ Interface visual clara com status de validação

### Testes Automatizados
- ✅ Testes unitários customizados para o backend
- ✅ Testes de integração para APIs
- ✅ Testes Gherkin (Cucumber) para funcionalidades do frontend
- ✅ Cobertura completa das regras de negócio

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Linguagem com tipagem estática
- **SQLite** - Banco de dados local
- **Arquitetura Limpa** - Separação de responsabilidades

### Frontend
- **React** - Biblioteca para interface de usuário
- **TypeScript** - Linguagem com tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **Axios** - Cliente HTTP

### Testes
- **Cucumber** - Testes BDD com Gherkin
- **Framework de testes customizado** - Testes unitários do backend

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Git

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/SirBaza/Gestao-de-Ingressos-de-Eventos---Testes-Automatizados.git
cd Gestao-de-Ingressos-de-Eventos---Testes-Automatizados
```

### 2. Configurar o Backend
```bash
cd backend
npm install
```

### 3. Configurar o Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Executando o Projeto

### 1. Iniciar o Backend (Porta 3001)
```bash
cd backend
npm start
```

O backend estará disponível em: `http://localhost:3001/api`

### 2. Iniciar o Frontend (Porta 3000)
Em um novo terminal:
```bash
cd frontend
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

### 3. Verificar se está funcionando
Acesse `http://localhost:3001/api/health` para verificar o status da API.

## 🧪 Executando os Testes

### Testes do Backend
```bash
cd backend
npm test
```

### Testes do Frontend (Cucumber)
```bash
cd frontend
npm test
```

## 📱 Como Usar o Sistema

### 1. Criar um Evento
1. Acesse o frontend em `http://localhost:3000`
2. Clique em "Criar Evento"
3. Preencha os dados do evento
4. Clique em "Criar Evento"

### 2. Comprar Ingresso
1. Na lista de eventos, clique em "Comprar Ingresso"
2. Preencha seus dados pessoais
3. Escolha o tipo e quantidade de ingressos
4. Clique em "Comprar Ingresso"
5. Guarde o código QR gerado

### 3. Validar Ingresso
1. Clique em "Validar Ingresso" no menu
2. Cole ou digite o código QR do ingresso
3. Clique em "Validar Ingresso"
4. Verifique o resultado da validação

## 🏗️ Arquitetura do Sistema

### Backend - Arquitetura Limpa
```
src/
├── domain/          # Regras de negócio
│   ├── entities/    # Entidades do domínio
│   ├── usecases/    # Casos de uso
│   └── repositories.ts # Interfaces dos repositórios
├── data/            # Camada de dados
│   ├── repositories/ # Implementações dos repositórios
│   └── services/    # Serviços de dados
├── controllers/     # Controladores HTTP
├── infra/          # Infraestrutura
│   └── database/   # Configuração do banco
└── main/           # Composição e factories
    ├── factories/  # Factories dos controladores
    └── router.ts   # Configuração das rotas
```

### Frontend - Estrutura por Funcionalidade
```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── services/      # Serviços de API
├── types/         # Definições de tipos
└── main.tsx       # Ponto de entrada
```

## 🔐 Segurança Implementada

- **Hash de Segurança**: Cada ingresso possui um hash único para prevenir falsificação
- **Validação de Entrada Única**: Ingressos só podem ser utilizados uma vez
- **Validação de Dados**: Todas as entradas são validadas no backend
- **Códigos QR Únicos**: Cada compra gera um código QR único e irrepetível

## 📊 Testes Implementados

### Backend
- ✅ Testes unitários para entidades
- ✅ Testes de validação de dados
- ✅ Testes de casos de uso
- ✅ Testes de regras de negócio

### Frontend (Cucumber/Gherkin)
- ✅ Cenários de gestão de eventos
- ✅ Cenários de compra de ingressos
- ✅ Cenários de validação de ingressos
- ✅ Cenários de erro e validação

## 🎯 Funcionalidades Principais

### ✅ Gestão de Eventos
- Criar eventos com data futura
- Definir capacidade máxima
- Controlar status (ativo/cancelado/finalizado)

### ✅ Venda de Ingressos
- Cadastro completo do participante
- Tipos de ingresso com preços diferentes
- Geração automática de código QR
- Controle de quantidade disponível

### ✅ Validação de Entrada
- Leitura de código QR
- Verificação de autenticidade
- Prevenção de reutilização
- Interface visual clara de validação

## 🚫 Limitações Conhecidas

- **Sem autenticação**: Sistema não possui login/logout
- **Pagamento simulado**: Não há integração com gateway de pagamento
- **QR Code visual**: Mostra apenas o código string (não o QR visual)
- **Sem upload de foto**: Conforme especificado, não implementa foto

## 📈 Melhorias Futuras

- Sistema de autenticação e autorização
- Integração com gateway de pagamento
- Geração visual de QR Codes
- Sistema de notificações
- Relatórios e dashboard
- Upload de imagens dos eventos
- Sistema de avaliação pós-evento

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique se todas as dependências foram instaladas
2. Confira se o backend está rodando na porta 3001
3. Verifique os logs do console para erros
4. Abra uma issue no GitHub com detalhes do problema

---

**Desenvolvido com ❤️ em TypeScript** Gest-o-de-Ingressos-de-Eventos---Testes-Automatizados
Objetivo: Desenvolver uma plataforma web completa para o gerenciamento de eventos. O sistema deve permitir que organizadores criem eventos, vendam ingressos e, de forma segura, validem a entrada dos participantes usando a câmera de um dispositivo e a tecnologia de código QR, tudo dentro de um ambiente de navegador.
