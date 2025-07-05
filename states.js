/**
 * Rotas para Estados
 * 
 * Gerencia todas as operações relacionadas aos estados fictícios
 */

const express = require('express');
const router = express.Router();
const State = require('../models/State');
const database = require('../config/database');

/**
 * POST /api/states
 * Cria um novo estado
 */
router.post('/', async (req, res) => {
  try {
    const { name, region, government_type, player_id } = req.body;

    // Validar dados obrigatórios
    if (!name || !region || !government_type) {
      return res.status(400).json({
        error: true,
        message: 'Nome, região e tipo de governo são obrigatórios',
        required: ['name', 'region', 'government_type']
      });
    }

    // Verificar se já existe um estado com esse nome
    const existingStates = await database.getStates();
    const nameExists = existingStates.some(state => 
      state.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
      return res.status(409).json({
        error: true,
        message: 'Já existe um estado com esse nome. Escolha outro nome!',
        suggestion: 'Que tal adicionar um número ou modificar um pouco o nome?'
      });
    }

    // Criar novo estado
    const stateData = {
      name: name.trim(),
      region,
      government_type,
      player_id: player_id || null,
      indicators: {
        economia: 50,
        educacao: 50,
        saude: 50,
        seguranca: 50,
        cultura: 50,
        satisfacao_popular: 50,
        corrupcao: 50
      }
    };

    const newState = new State(stateData);
    
    // Validar estado
    const validation = newState.validate();
    if (!validation.isValid) {
      return res.status(400).json({
        error: true,
        message: 'Dados inválidos para criação do estado',
        errors: validation.errors
      });
    }

    // Salvar no banco
    const savedState = await database.createState(newState.toJSON());

    res.status(201).json({
      success: true,
      message: `🎉 Estado ${savedState.name} criado com sucesso!`,
      state: savedState,
      tips: [
        'Todos os indicadores começam em 50/100',
        'Tome decisões políticas para melhorar seus indicadores',
        'Acompanhe os rankings para ver como você está se saindo!'
      ]
    });

  } catch (error) {
    console.error('Erro ao criar estado:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao criar estado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/states/:id
 * Busca um estado específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const state = await database.getStateById(id);
    
    if (!state) {
      return res.status(404).json({
        error: true,
        message: 'Estado não encontrado',
        suggestion: 'Verifique se o ID está correto ou se o estado ainda existe'
      });
    }

    // Criar objeto State para calcular informações adicionais
    const stateObj = new State(state);

    res.json({
      success: true,
      state: stateObj.toJSON(),
      lastUpdate: state.updated_at
    });

  } catch (error) {
    console.error('Erro ao buscar estado:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao buscar estado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/states
 * Lista todos os estados (com paginação opcional)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, region, government_type, sort_by = 'created_at' } = req.query;
    
    let states = await database.getStates();

    // Filtros
    if (region) {
      states = states.filter(state => state.region === region);
    }

    if (government_type) {
      states = states.filter(state => state.government_type === government_type);
    }

    // Ordenação
    states.sort((a, b) => {
      switch (sort_by) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'overall_score':
          const scoreA = new State(a).calculateOverallScore();
          const scoreB = new State(b).calculateOverallScore();
          return scoreB - scoreA;
        case 'created_at':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedStates = states.slice(startIndex, endIndex);

    // Adicionar informações calculadas
    const statesWithInfo = paginatedStates.map(state => {
      const stateObj = new State(state);
      return stateObj.toJSON();
    });

    res.json({
      success: true,
      states: statesWithInfo,
      pagination: {
        current_page: parseInt(page),
        per_page: parseInt(limit),
        total: states.length,
        total_pages: Math.ceil(states.length / limit),
        has_next: endIndex < states.length,
        has_prev: page > 1
      },
      filters: {
        region,
        government_type,
        sort_by
      }
    });

  } catch (error) {
    console.error('Erro ao listar estados:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao listar estados',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/states/:id/decision
 * Aplica uma decisão política ao estado
 */
router.patch('/:id/decision', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision_id, option_id } = req.body;

    if (!decision_id || !option_id) {
      return res.status(400).json({
        error: true,
        message: 'ID da decisão e da opção são obrigatórios',
        required: ['decision_id', 'option_id']
      });
    }

    // Buscar estado
    const state = await database.getStateById(id);
    if (!state) {
      return res.status(404).json({
        error: true,
        message: 'Estado não encontrado'
      });
    }

    // Buscar decisão
    const decisions = await database.getDecisions();
    const decision = decisions.find(d => d.id === decision_id);
    
    if (!decision) {
      return res.status(404).json({
        error: true,
        message: 'Decisão não encontrada'
      });
    }

    // Buscar opção
    const option = decision.options.find(o => o.id === option_id);
    if (!option) {
      return res.status(404).json({
        error: true,
        message: 'Opção de decisão não encontrada'
      });
    }

    // Verificar cooldown (24 horas entre decisões)
    if (state.last_decision_at) {
      const lastDecision = new Date(state.last_decision_at);
      const now = new Date();
      const hoursSinceLastDecision = (now - lastDecision) / (1000 * 60 * 60);
      
      const cooldownHours = parseInt(process.env.DECISION_COOLDOWN_HOURS) || 24;
      
      if (hoursSinceLastDecision < cooldownHours) {
        const remainingHours = Math.ceil(cooldownHours - hoursSinceLastDecision);
        return res.status(429).json({
          error: true,
          message: `Calma aí, chefe! Você precisa esperar ${remainingHours}h para tomar outra decisão.`,
          cooldown: {
            remaining_hours: remainingHours,
            next_decision_at: new Date(lastDecision.getTime() + (cooldownHours * 60 * 60 * 1000)).toISOString()
          }
        });
      }
    }

    // Aplicar efeitos da decisão
    const stateObj = new State(state);
    stateObj.applyDecisionEffects(option.effects);
    stateObj.addDecisionToHistory(decision_id, option_id, option.effects);

    // Salvar estado atualizado
    const updatedState = await database.updateState(id, stateObj.toJSON());

    // Gerar texto de resultado
    const Decision = require('../models/Decision');
    const resultText = Decision.generateResultText(option, option.effects);

    res.json({
      success: true,
      message: 'Decisão aplicada com sucesso!',
      state: updatedState,
      decision: {
        id: decision_id,
        title: decision.title,
        chosen_option: option.text,
        effects: option.effects
      },
      result: {
        text: resultText,
        new_indicators: updatedState.indicators,
        changes: option.effects
      }
    });

  } catch (error) {
    console.error('Erro ao aplicar decisão:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao aplicar decisão',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/states/:id
 * Remove um estado (apenas para desenvolvimento)
 */
router.delete('/:id', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        error: true,
        message: 'Operação não permitida em produção'
      });
    }

    const { id } = req.params;
    const states = await database.getStates();
    const stateIndex = states.findIndex(state => state.id === id);

    if (stateIndex === -1) {
      return res.status(404).json({
        error: true,
        message: 'Estado não encontrado'
      });
    }

    const deletedState = states[stateIndex];
    states.splice(stateIndex, 1);
    await database.saveStates(states);

    res.json({
      success: true,
      message: `Estado ${deletedState.name} removido com sucesso`,
      deleted_state: deletedState
    });

  } catch (error) {
    console.error('Erro ao remover estado:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao remover estado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

