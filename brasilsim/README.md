# BrasilSim - Simulação Política Brasileira 🇧🇷

Um jogo online de simulação política e social inspirado em NationStates, com temática brasileira. Crie e administre seu próprio estado fictício do Brasil, tome decisões políticas que afetam indicadores sociais e econômicos, e compete com outros jogadores nos rankings nacionais.

## 🎮 Sobre o Jogo

BrasilSim permite que você:

- **Crie seu Estado**: Escolha nome, região (Norte, Sul, Sudeste, etc.) e tipo de governo (Democracia, Tecnocracia, Coronelismo)
- **Tome Decisões Políticas**: Enfrente dilemas que afetam 7 indicadores: Economia, Educação, Saúde, Segurança, Cultura, Satisfação Popular e Corrupção
- **Compete nos Rankings**: Veja como seu estado se compara com outros em diversos indicadores nacionais
- **Acompanhe seu Progresso**: Monitore a evolução dos seus indicadores ao longo do tempo

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Criação de Estados
- Formulário intuitivo para criação de estados
- Validação de dados em tempo real
- Armazenamento persistente no backend

### ✅ Dashboard de Indicadores
- Visualização clara dos 7 indicadores principais
- Barras de progresso coloridas e responsivas
- Histórico de decisões tomadas

### ✅ Sistema de Decisões Políticas
- Decisões aleatórias baseadas no contexto do estado
- Múltiplas opções com efeitos diferentes nos indicadores
- Cooldown de 24 horas entre decisões

### ✅ Rankings Nacionais
- 11 rankings diferentes (Economia, Educação, Saúde, etc.)
- Ranking geral baseado em pontuação combinada
- Estatísticas globais do jogo

### ✅ Interface Moderna e Responsiva
- Design brasileiro com cores da bandeira
- Totalmente responsivo (desktop e mobile)
- Navegação intuitiva entre páginas
- Notificações toast para feedback do usuário

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sistema de arquivos JSON** - Armazenamento de dados (facilmente migrável para PostgreSQL)
- **CORS** - Comunicação cross-origin

### Frontend
- **HTML5, CSS3, JavaScript** - Base da aplicação
- **Tailwind CSS** - Framework de estilos
- **Lucide Icons** - Ícones modernos
- **Fetch API** - Comunicação com backend

### Arquitetura
- **REST API** - Comunicação frontend-backend
- **SPA (Single Page Application)** - Navegação fluida
- **Modular** - Código bem organizado e reutilizável

## 📁 Estrutura do Projeto

```
brasilsim/
├── backend/                 # Servidor Node.js/Express
│   ├── config/             # Configurações do banco
│   ├── controllers/        # Lógica de negócio (futuro)
│   ├── data/              # Armazenamento JSON
│   ├── middleware/        # Middlewares (futuro)
│   ├── models/           # Modelos de dados
│   ├── routes/           # Rotas da API
│   ├── .env              # Variáveis de ambiente
│   ├── package.json      # Dependências do backend
│   └── server.js         # Servidor principal
└── frontend/             # Interface web
    ├── css/             # Estilos customizados
    ├── js/              # Lógica JavaScript
    │   ├── api.js       # Comunicação com API
    │   ├── app.js       # Aplicação principal
    │   ├── components.js # Componentes reutilizáveis
    │   └── utils.js     # Utilitários
    ├── assets/          # Recursos estáticos
    └── index.html       # Página principal
```

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js (versão 12 ou superior)
- npm (gerenciador de pacotes)

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd brasilsim
```

### 2. Configure o Backend
```bash
cd backend
npm install
npm run dev
```

O backend estará rodando em `http://localhost:3003`

### 3. Configure o Frontend
```bash
cd ../frontend
python3 -m http.server 8080
```

O frontend estará disponível em `http://localhost:8080`

### 4. Acesse o jogo
Abra seu navegador e vá para `http://localhost:8080`

## 🎯 Como Jogar

### 1. Criar seu Estado
- Clique em "Começar Agora" na página inicial
- Preencha o nome do seu estado (seja criativo!)
- Escolha uma região do Brasil
- Selecione o tipo de governo:
  - **Democracia**: Foca na satisfação popular
  - **Tecnocracia**: Foca em eficiência e dados
  - **Coronelismo**: Poder local concentrado

### 2. Gerenciar Indicadores
Seu estado possui 7 indicadores que começam em 50/100:
- **Economia**: Desenvolvimento econômico
- **Educação**: Qualidade do ensino
- **Saúde**: Sistema de saúde
- **Segurança**: Índices de criminalidade
- **Cultura**: Valorização cultural
- **Satisfação Popular**: Felicidade do povo
- **Corrupção**: Níveis de corrupção (menor é melhor)

### 3. Tomar Decisões
- A cada 24 horas você pode tomar uma nova decisão política
- Cada decisão apresenta 2-3 opções com efeitos diferentes
- Analise cuidadosamente os impactos antes de escolher
- Suas decisões ficam registradas no histórico

### 4. Competir nos Rankings
- Acompanhe sua posição em 11 rankings diferentes
- Compare seu desempenho com outros jogadores
- Tente alcançar o topo dos rankings nacionais

## 🔌 API Endpoints

### Estados
- `POST /api/states` - Criar novo estado
- `GET /api/states/:id` - Buscar estado específico
- `PATCH /api/states/:id/decision` - Aplicar decisão política

### Decisões
- `GET /api/decisions` - Listar todas as decisões
- `GET /api/decisions/random/:stateId` - Obter decisão aleatória

### Rankings
- `GET /api/rankings` - Obter todos os rankings
- `GET /api/rankings/:id` - Obter ranking específico

### Sistema
- `GET /health` - Verificar status do servidor

## 🎨 Design e UX

### Cores Brasileiras
- **Verde**: #009739 (Verde da bandeira)
- **Amarelo**: #FEDD00 (Amarelo da bandeira)
- **Azul**: #012169 (Azul da bandeira)

### Características da Interface
- Design limpo e moderno
- Navegação intuitiva
- Feedback visual imediato
- Responsivo para todos os dispositivos
- Linguagem informal e divertida

## 🔮 Funcionalidades Futuras

### Expansões Planejadas
- **Sistema de Autenticação**: Login e perfis de usuário
- **Diplomacia**: Interação entre estados
- **Eleições Nacionais**: Eventos globais
- **Eventos Aleatórios**: Crises e oportunidades
- **Migração para PostgreSQL**: Banco de dados robusto
- **Sistema de Conquistas**: Badges e recompensas
- **Chat entre Jogadores**: Comunicação social
- **Gráficos Históricos**: Evolução dos indicadores

### Melhorias Técnicas
- **Autenticação JWT**: Segurança aprimorada
- **WebSockets**: Atualizações em tempo real
- **PWA**: Aplicativo web progressivo
- **Testes Automatizados**: Cobertura de testes
- **CI/CD**: Deploy automatizado

## 🤝 Contribuindo

Este projeto foi desenvolvido como uma demonstração técnica, mas contribuições são bem-vindas!

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes
- Mantenha o código limpo e bem comentado
- Siga as convenções de nomenclatura existentes
- Teste suas mudanças antes de submeter
- Documente novas funcionalidades

## 📝 Licença

Este projeto é uma demonstração técnica e está disponível para fins educacionais e de aprendizado.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ e muito ☕ por um entusiasta de simulações políticas e tecnologia brasileira.

---

**BrasilSim** - Onde a política encontra a diversão! 🎮🇧🇷

