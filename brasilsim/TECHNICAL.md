# Documentação Técnica - BrasilSim

## Arquitetura do Sistema

### Visão Geral
BrasilSim é uma aplicação web full-stack que simula um jogo de política brasileira. A arquitetura segue o padrão cliente-servidor com comunicação via REST API.

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐
│                 │ ◄──────────────► │                 │
│    Frontend     │                 │     Backend     │
│  (HTML/CSS/JS)  │                 │  (Node.js/Express) │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │   File System   │
                                    │   (JSON Files)  │
                                    └─────────────────┘
```

## Backend (Node.js/Express)

### Estrutura de Arquivos
```
backend/
├── config/
│   └── database.js          # Configuração do sistema de arquivos
├── models/
│   ├── State.js            # Modelo de Estado
│   ├── Decision.js         # Modelo de Decisão
│   └── Ranking.js          # Modelo de Ranking
├── routes/
│   ├── states.js           # Rotas de estados
│   ├── decisions.js        # Rotas de decisões
│   └── rankings.js         # Rotas de rankings
├── data/                   # Armazenamento JSON
├── .env                    # Variáveis de ambiente
├── package.json           # Dependências
└── server.js              # Servidor principal
```

### Modelos de Dados

#### Estado (State)
```javascript
{
  id: "uuid",
  name: "string",
  region: "Norte|Nordeste|Centro-Oeste|Sudeste|Sul",
  government: "Democracia|Tecnocracia|Coronelismo",
  indicators: {
    economia: 50,
    educacao: 50,
    saude: 50,
    seguranca: 50,
    cultura: 50,
    satisfacao: 50,
    corrupcao: 50
  },
  decisions: [],
  createdAt: "ISO Date",
  lastDecision: "ISO Date"
}
```

#### Decisão (Decision)
```javascript
{
  id: "uuid",
  title: "string",
  description: "string",
  options: [
    {
      text: "string",
      effects: {
        economia: number,
        educacao: number,
        // ... outros indicadores
      }
    }
  ],
  context: "string",
  government: "string" // opcional
}
```

### APIs REST

#### Estados
- **POST /api/states**
  - Cria novo estado
  - Body: `{ name, region, government }`
  - Response: Estado criado

- **GET /api/states/:id**
  - Busca estado por ID
  - Response: Dados do estado

- **PATCH /api/states/:id/decision**
  - Aplica decisão ao estado
  - Body: `{ decisionId, optionIndex }`
  - Response: Estado atualizado

#### Decisões
- **GET /api/decisions**
  - Lista todas as decisões
  - Response: Array de decisões

- **GET /api/decisions/random/:stateId**
  - Obtém decisão aleatória para o estado
  - Response: Decisão filtrada por contexto

#### Rankings
- **GET /api/rankings**
  - Obtém todos os rankings
  - Response: Object com rankings organizados

### Sistema de Armazenamento

Atualmente utiliza sistema de arquivos JSON para simplicidade:

```javascript
// Estrutura do arquivo states.json
{
  "states": {
    "uuid1": { /* dados do estado */ },
    "uuid2": { /* dados do estado */ }
  }
}
```

**Vantagens:**
- Simplicidade de implementação
- Não requer configuração de banco
- Fácil para desenvolvimento e testes

**Limitações:**
- Não é adequado para produção
- Sem transações ACID
- Performance limitada

### Middleware e Configurações

```javascript
// Middlewares utilizados
app.use(cors());                    // CORS para frontend
app.use(express.json());            // Parse JSON
app.use(express.urlencoded());      // Parse form data
app.use('/api/states', statesRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/rankings', rankingsRouter);
```

## Frontend (HTML/CSS/JavaScript)

### Estrutura de Arquivos
```
frontend/
├── css/
│   └── styles.css          # Estilos customizados
├── js/
│   ├── api.js             # Comunicação com backend
│   ├── app.js             # Aplicação principal
│   ├── components.js      # Componentes reutilizáveis
│   └── utils.js           # Utilitários
├── assets/                # Recursos estáticos
└── index.html            # Página principal SPA
```

### Arquitetura Frontend

#### Single Page Application (SPA)
- Uma única página HTML com navegação via JavaScript
- Roteamento baseado em URL parameters (`?page=dashboard`)
- Estado da aplicação gerenciado em memória

#### Gerenciamento de Estado
```javascript
// Estado global da aplicação
const AppState = {
  currentPage: 'home',
  currentState: null,
  rankings: null,
  decisions: []
};
```

#### Sistema de Componentes
```javascript
// Exemplo de componente reutilizável
function createIndicatorCard(name, value, color) {
  return `
    <div class="bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800">${name}</h3>
      <div class="mt-4">
        <div class="bg-gray-200 rounded-full h-4">
          <div class="bg-${color}-500 h-4 rounded-full" 
               style="width: ${value}%"></div>
        </div>
        <span class="text-2xl font-bold text-${color}-600">${value}/100</span>
      </div>
    </div>
  `;
}
```

### Comunicação com API

#### Módulo API (api.js)
```javascript
const API = {
  baseURL: 'http://localhost:3003/api',
  
  async createState(stateData) {
    const response = await fetch(`${this.baseURL}/states`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stateData)
    });
    return response.json();
  }
  
  // ... outros métodos
};
```

#### Tratamento de Erros
```javascript
async function handleAPICall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    console.error('API Error:', error);
    showToast('Erro de conexão com o servidor', 'error');
    return { success: false, error };
  }
}
```

## Fluxo de Dados

### Criação de Estado
```
1. Usuário preenche formulário
2. Frontend valida dados
3. POST /api/states
4. Backend cria estado com indicadores padrão (50)
5. Backend salva em arquivo JSON
6. Frontend recebe resposta
7. Redirecionamento para dashboard
```

### Aplicação de Decisão
```
1. Frontend solicita decisão aleatória
2. GET /api/decisions/random/:stateId
3. Backend filtra decisões por contexto
4. Frontend exibe opções ao usuário
5. Usuário escolhe opção
6. PATCH /api/states/:id/decision
7. Backend aplica efeitos aos indicadores
8. Backend atualiza arquivo JSON
9. Frontend atualiza interface
```

### Atualização de Rankings
```
1. Frontend solicita rankings
2. GET /api/rankings
3. Backend calcula rankings em tempo real
4. Backend ordena estados por critérios
5. Frontend renderiza tabelas de ranking
```

## Configuração de Desenvolvimento

### Variáveis de Ambiente (.env)
```bash
# Porta do servidor
PORT=3003

# Ambiente
NODE_ENV=development

# Diretório de dados
DATA_DIR=./data

# CORS
CORS_ORIGIN=http://localhost:8080
```

### Scripts NPM
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"No tests yet\"",
    "lint": "eslint ."
  }
}
```

## Considerações de Performance

### Backend
- **Caching**: Rankings são calculados sob demanda
- **File I/O**: Operações síncronas para simplicidade
- **Memory Usage**: Estados carregados em memória

### Frontend
- **DOM Manipulation**: Recriação de elementos para simplicidade
- **API Calls**: Sem cache, requisições diretas
- **Bundle Size**: Sem bundler, arquivos servidos diretamente

## Segurança

### Implementado
- CORS configurado para origem específica
- Validação básica de entrada
- Sanitização de dados de entrada

### Não Implementado (Futuro)
- Autenticação de usuários
- Rate limiting
- Validação de esquema rigorosa
- Sanitização avançada

## Migração para Produção

### Banco de Dados
Para produção, migrar para PostgreSQL:

```sql
-- Tabela de estados
CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  region VARCHAR(50) NOT NULL,
  government VARCHAR(50) NOT NULL,
  indicators JSONB NOT NULL,
  decisions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  last_decision TIMESTAMP
);

-- Tabela de decisões
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  options JSONB NOT NULL,
  context VARCHAR(100),
  government VARCHAR(50)
);
```

### Deploy
1. **Backend**: Heroku, Railway, ou VPS
2. **Frontend**: Netlify, Vercel, ou CDN
3. **Database**: PostgreSQL (Heroku Postgres, Supabase)
4. **Environment**: Variáveis de ambiente para produção

### Monitoramento
- Logs estruturados
- Health checks
- Error tracking (Sentry)
- Performance monitoring

## Testes

### Estrutura de Testes (Futuro)
```
tests/
├── unit/
│   ├── models/
│   └── utils/
├── integration/
│   └── api/
└── e2e/
    └── user-flows/
```

### Ferramentas Sugeridas
- **Unit Tests**: Jest
- **Integration Tests**: Supertest
- **E2E Tests**: Playwright ou Cypress
- **Coverage**: Istanbul/NYC

## Contribuição

### Padrões de Código
- **JavaScript**: ES6+ features
- **Naming**: camelCase para variáveis, PascalCase para classes
- **Comments**: JSDoc para funções públicas
- **Error Handling**: Try-catch com logs estruturados

### Git Workflow
1. Feature branches a partir de `main`
2. Commits semânticos (feat, fix, docs, etc.)
3. Pull requests com review
4. Merge após aprovação

---

Esta documentação técnica serve como guia para desenvolvedores que queiram entender, modificar ou expandir o BrasilSim.

