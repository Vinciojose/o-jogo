/**
 * Rotas para Decisões Políticas
 * 
 * Gerencia as decisões políticas disponíveis no jogo
 */

const express = require('express');
const router = express.Router();
const Decision = require('../models/Decision');
const database = require('../config/database');

/**
 * GET /api/decisions
 * Lista todas as decisões disponíveis
 */
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let decisions = await database.getDecisions();

    // Filtros
    if (category) {
      decisions = decisions.filter(decision => decision.category === category);
    }

    if (difficulty) {
      decisions = decisions.filter(decision => decision.difficulty === difficulty);
    }

    res.json({
      success: true,
      decisions: decisions,
      total: decisions.length,
      categories: [...new Set(decisions.map(d => d.category))],
      difficulties: [...new Set(decisions.map(d => d.difficulty))]
    });

  } catch (error) {
    console.error('Erro ao listar decisões:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao listar decisões',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/decisions/:id
 * Busca uma decisão específica por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const decisions = await database.getDecisions();
    const decision = decisions.find(d => d.id === id);

    if (!decision) {
      return res.status(404).json({
        error: true,
        message: 'Decisão não encontrada',
        suggestion: 'Verifique se o ID está correto'
      });
    }

    res.json({
      success: true,
      decision: decision
    });

  } catch (error) {
    console.error('Erro ao buscar decisão:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao buscar decisão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/decisions/random/:stateId
 * Gera uma decisão aleatória relevante para o estado
 */
router.get('/random/:stateId', async (req, res) => {
  try {
    const { stateId } = req.params;
    
    // Buscar estado para contexto
    const state = await database.getStateById(stateId);
    if (!state) {
      return res.status(404).json({
        error: true,
        message: 'Estado não encontrado'
      });
    }

    // Verificar cooldown
    if (state.last_decision_at) {
      const lastDecision = new Date(state.last_decision_at);
      const now = new Date();
      const hoursSinceLastDecision = (now - lastDecision) / (1000 * 60 * 60);
      
      const cooldownHours = parseInt(process.env.DECISION_COOLDOWN_HOURS) || 24;
      
      if (hoursSinceLastDecision < cooldownHours) {
        const remainingHours = Math.ceil(cooldownHours - hoursSinceLastDecision);
        return res.status(429).json({
          error: true,
          message: `Opa! Você precisa esperar ${remainingHours}h para tomar outra decisão.`,
          cooldown: {
            remaining_hours: remainingHours,
            next_decision_at: new Date(lastDecision.getTime() + (cooldownHours * 60 * 60 * 1000)).toISOString()
          },
          tip: 'Use esse tempo para analisar os rankings e ver como outros estados estão se saindo!'
        });
      }
    }

    // Buscar decisões disponíveis
    const decisions = await database.getDecisions();
    
    // Filtrar decisões já tomadas recentemente (últimas 3)
    const recentDecisions = (state.decision_history || [])
      .slice(-3)
      .map(d => d.decision_id);
    
    const availableDecisions = decisions.filter(decision => 
      !recentDecisions.includes(decision.id)
    );

    if (availableDecisions.length === 0) {
      // Se não há decisões disponíveis, usar todas
      availableDecisions.push(...decisions);
    }

    // Gerar decisão relevante
    const randomDecision = Decision.generateRandomDecision(
      state.indicators, 
      availableDecisions
    );

    // Adicionar contexto baseado no estado atual
    const context = generateDecisionContext(state, randomDecision);

    res.json({
      success: true,
      decision: randomDecision,
      context: context,
      state_summary: {
        name: state.name,
        region: state.region,
        government_type: state.government_type,
        overall_score: new (require('../models/State'))(state).calculateOverallScore()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar decisão aleatória:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao gerar decisão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/decisions
 * Cria uma nova decisão (apenas para desenvolvimento)
 */
router.post('/', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        error: true,
        message: 'Operação não permitida em produção'
      });
    }

    const decisionData = req.body;
    const decision = new Decision(decisionData);
    
    // Validar decisão
    const validation = decision.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: true,
        message: 'Dados inválidos para criação da decisão',
        errors: validation.errors
      });
    }

    // Adicionar ID único
    decision.id = database.generateId();

    // Salvar decisão
    const decisions = await database.getDecisions();
    decisions.push(decision.toJSON());
    await database.writeFile(
      require('path').join(__dirname, '../data/decisions.json'),
      decisions
    );

    res.status(201).json({
      success: true,
      message: 'Decisão criada com sucesso!',
      decision: decision.toJSON()
    });

  } catch (error) {
    console.error('Erro ao criar decisão:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao criar decisão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Gera contexto personalizado para a decisão baseado no estado
 */
function generateDecisionContext(state, decision) {
  const contexts = [];
  
  // Contexto baseado nos indicadores baixos
  Object.keys(state.indicators).forEach(indicator => {
    const value = state.indicators[indicator];
    if (value < 30) {
      switch (indicator) {
        case 'economia':
          contexts.push('A economia do seu estado está em crise! Esta decisão pode ser crucial.');
          break;
        case 'educacao':
          contexts.push('O sistema educacional precisa de atenção urgente.');
          break;
        case 'saude':
          contexts.push('A saúde pública está em estado crítico.');
          break;
        case 'seguranca':
          contexts.push('A violência está fora de controle no seu estado.');
          break;
        case 'satisfacao_popular':
          contexts.push('Seu povo está muito insatisfeito com o governo!');
          break;
        case 'corrupcao':
          if (value > 70) {
            contexts.push('A corrupção está corroendo as instituições.');
          }
          break;
      }
    }
  });

  // Contexto baseado no tipo de governo
  switch (state.government_type) {
    case 'Democracia':
      contexts.push('Como uma democracia, a opinião popular é muito importante.');
      break;
    case 'Tecnocracia':
      contexts.push('Seu governo técnico deve tomar decisões baseadas em dados.');
      break;
    case 'Coronelismo':
      contexts.push('O poder local influencia muito as decisões políticas.');
      break;
  }

  // Contexto baseado na região
  switch (state.region) {
    case 'Norte':
      contexts.push('A região Norte tem desafios únicos de desenvolvimento.');
      break;
    case 'Nordeste':
      contexts.push('O Nordeste tem uma rica cultura e desafios socioeconômicos.');
      break;
    case 'Centro-Oeste':
      contexts.push('O agronegócio é fundamental para a economia da região.');
      break;
    case 'Sudeste':
      contexts.push('Como região mais industrializada, as decisões têm grande impacto.');
      break;
    case 'Sul':
      contexts.push('A região Sul tem tradições europeias e economia diversificada.');
      break;
  }

  return {
    messages: contexts.slice(0, 2), // Máximo 2 contextos
    urgency: getDecisionUrgency(state),
    recommendation: getDecisionRecommendation(state, decision)
  };
}

/**
 * Calcula urgência da decisão baseada no estado
 */
function getDecisionUrgency(state) {
  const criticalIndicators = Object.keys(state.indicators).filter(
    indicator => state.indicators[indicator] < 25
  );

  if (criticalIndicators.length >= 3) return 'CRÍTICA';
  if (criticalIndicators.length >= 1) return 'ALTA';
  
  const goodIndicators = Object.keys(state.indicators).filter(
    indicator => state.indicators[indicator] > 75
  );
  
  if (goodIndicators.length >= 4) return 'BAIXA';
  return 'MÉDIA';
}

/**
 * Gera recomendação baseada no estado e decisão
 */
function getDecisionRecommendation(state, decision) {
  const recommendations = [];

  // Analisar cada opção da decisão
  decision.options.forEach((option, index) => {
    let score = 0;
    let reasoning = [];

    Object.keys(option.effects).forEach(indicator => {
      const effect = option.effects[indicator];
      const currentValue = state.indicators[indicator];

      if (currentValue < 40 && effect > 0) {
        score += 2; // Bonus por melhorar indicador baixo
        reasoning.push(`Melhora ${indicator} que está baixo`);
      } else if (currentValue > 60 && effect < 0) {
        score -= 1; // Penalidade por piorar indicador bom
        reasoning.push(`Piora ${indicator} que está bom`);
      } else if (effect > 0) {
        score += 1;
      }
    });

    recommendations.push({
      option_index: index,
      option_text: option.text,
      score: score,
      reasoning: reasoning.slice(0, 2) // Máximo 2 razões
    });
  });

  // Ordenar por score
  recommendations.sort((a, b) => b.score - a.score);

  return {
    best_option: recommendations[0],
    all_options: recommendations
  };
}

module.exports = router;

