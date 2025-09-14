# Sistema de Gestão de Ingressos de Eventos

## Descrição

Sistema completo para gestão de eventos e venda de ingressos com validação via código QR. O projeto é composto por backend Node.js/TypeScript e frontend React/TypeScript, ambos com cobertura de testes.

## Funcionalidades Principais

### 📋 Gestão de Eventos (Organizadores)
- Criar, editar e remover eventos
- Definir tipos de ingressos (VIP, Pista, etc.) com preços
- Visualizar estatísticas de vendas e check-ins
- Dashboard com visão geral dos eventos

### 🎫 Venda de Ingressos (Público)
- Visualizar eventos disponíveis
- Comprar ingressos online
- Receber códigos QR únicos para cada ingresso
- Consultar ingressos comprados

### 📱 Validação de Entrada
- Validar ingressos via código QR
- Sistema de segurança com hash SHA256
- Prevenção contra uso duplicado
- Interface web para validação

### 👥 Sistema de Usuários
- Registro e autenticação
- Dois tipos de usuário: Organizador e Comprador
- Sistema de JWT para autenticação
- Controle de acesso baseado em perfis

## Tecnologias Utilizadas

### Backend
- **Node.js** com **TypeScript**
- **Express.js** para API REST
- **JWT** para autenticação
- **bcryptjs** para criptografia de senhas
- **Vitest** para testes
- **SHA256** para validação de segurança

### Frontend
- **React** com **TypeScript**
- **React Router** para navegação
- **React Hook Form** para formulários
- **Axios** para requisições HTTP
- **React Hot Toast** para notificações
- **Vitest** e **Testing Library** para testes

## Estrutura do Projeto

```
├── backend/
│   ├── src/
│   │   ├── controladores/     # Controllers da API
│   │   ├── middlewares/       # Middlewares de autenticação
│   │   ├── modelos/          # Modelos de dados (em memória)
│   │   ├── rotas/            # Definição das rotas
│   │   ├── servicos/         # Serviços auxiliares
│   │   ├── tipos/            # Definições de tipos TypeScript
│   │   └── app.ts            # Arquivo principal da aplicação
│   ├── tests/                # Testes unitários e de integração
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── componentes/      # Componentes reutilizáveis
│   │   ├── contextos/        # Contextos React (autenticação)
│   │   ├── hooks/            # Custom hooks
│   │   ├── paginas/          # Páginas da aplicação
│   │   ├── servicos/         # Serviços de API
│   │   ├── tipos/            # Definições de tipos
│   │   └── App.tsx           # Componente raiz
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Backend

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute em modo de desenvolvimento:
```bash
npm run dev
```

4. Para executar os testes:
```bash
npm test
```

O backend estará disponível em `http://localhost:3001`

### Frontend

1. Navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute em modo de desenvolvimento:
```bash
npm start
```

4. Para executar os testes:
```bash
npm test
```

O frontend estará disponível em `http://localhost:3000`

## API Endpoints

### Autenticação
- `POST /api/auth/registrar` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/perfil` - Obter perfil do usuário (autenticado)

### Eventos
- `GET /api/eventos` - Listar eventos públicos
- `GET /api/eventos/:id` - Obter detalhes de um evento
- `POST /api/eventos` - Criar evento (organizador)
- `PUT /api/eventos/:id` - Atualizar evento (organizador)
- `DELETE /api/eventos/:id` - Remover evento (organizador)
- `GET /api/eventos/organizador/meus` - Eventos do organizador

### Ingressos
- `POST /api/ingressos/comprar` - Comprar ingressos
- `POST /api/ingressos/validar` - Validar ingresso via QR
- `GET /api/ingressos/comprador/:email` - Ingressos de um comprador
- `GET /api/ingressos/:id` - Detalhes de um ingresso
- `GET /api/ingressos/evento/:eventoId/estatisticas` - Estatísticas do evento

## Testes

O projeto possui cobertura abrangente de testes:

### Backend
- **Testes unitários** para modelos de dados
- **Testes de integração** para controllers
- **Testes de API** para endpoints
- Cobertura de funcionalidades críticas (autenticação, validação de ingressos)

### Frontend
- **Testes de componentes** com Testing Library
- **Testes de integração** com contextos React
- **Mocks** para APIs e dependências externas
- Testes de fluxos de usuário

Para executar todos os testes:

```bash
# Backend
cd backend && npm test

# Frontend  
cd frontend && npm test
```

## Recursos de Segurança

1. **Autenticação JWT** - Tokens seguros para autenticação
2. **Hash de senhas** - bcryptjs para criptografia
3. **Validação de ingressos** - SHA256 para verificação de integridade
4. **Controle de acesso** - Middlewares para autorização
5. **Validação de dados** - Verificações de entrada em todas as APIs

## Funcionalidades Especiais

### Sistema de QR Code
- Geração automática de códigos QR únicos
- Hash de segurança para prevenção de falsificação
- Validação em tempo real via interface web
- Controle de uso único por ingresso

### Dashboard de Estatísticas
- Acompanhamento de vendas em tempo real
- Percentual de ocupação do evento
- Taxa de check-in dos participantes
- Relatórios por tipo de ingresso

### Interface Responsiva
- Design adaptável para desktop e mobile
- Navegação intuitiva
- Feedback visual para todas as ações
- Notificações em tempo real

