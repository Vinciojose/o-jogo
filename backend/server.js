/**
 * BrasilSim - Servidor Principal
 * Jogo de Simulação Política Brasileira
 * 
 * Este é o servidor principal que gerencia todas as operações do jogo,
 * incluindo criação de estados, decisões políticas e rankings.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Importar rotas
const stateRoutes = require('./routes/states');
const rankingRoutes = require('./routes/rankings');
const decisionRoutes = require('./routes/decisions');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Permitir todas as origens para desenvolvimento
  credentials: true
}));

app.use(morgan('combined')); // Log das requisições
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL encoded

// Middleware para adicionar headers de segurança básicos
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BrasilSim Backend está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rotas da API
app.use('/api/states', stateRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/decisions', decisionRoutes);

// Rota de boas-vindas
app.get('/', (req, res) => {
  res.json({
    message: '🇧🇷 Bem-vindo ao BrasilSim! 🇧🇷',
    description: 'API para simulação política brasileira',
    endpoints: {
      health: '/health',
      states: '/api/states',
      rankings: '/api/rankings',
      decisions: '/api/decisions'
    },
    docs: 'Consulte a documentação para mais detalhes sobre como usar a API'
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.stack);
  
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Eita! Algo deu errado no servidor...',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Opa! Essa rota não existe. Verifique a URL e tente novamente.',
    path: req.originalUrl
  });
});

// Inicializar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BrasilSim Backend rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('🇧🇷 Pronto para simular a política brasileira!');
});

module.exports = app;

