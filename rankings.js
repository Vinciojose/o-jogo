/**
 * Rotas para Rankings
 * 
 * Gerencia todos os rankings e estatísticas do jogo
 */

const express = require('express');
const router = express.Router();
const Ranking = require('../models/Ranking');
const database = require('../config/database');

/**
 * GET /api/rankings
 * Retorna todos os rankings disponíveis
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const states = await database.getStates();
    
    if (states.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhum estado cadastrado ainda. Seja o primeiro!',
        rankings: [],
        stats: {
          total_states: 0,
          total_rankings: 0
        }
      });
    }

    // Gerar todos os rankings
    const allRankings = Ranking.generateAllRankings(states);
    
    // Limitar número de estados por ranking se especificado
    if (limit && limit !== 'all') {
      allRankings.rankings.forEach(ranking => {
        ranking.states = ranking.states.slice(0, parseInt(limit));
      });
    }

    // Gerar estatísticas adicionais
    const regionalStats = Ranking.generateRegionalStats(states);
    const governmentStats = Ranking.generateGovernmentStats(states);

    res.json({
      success: true,
      ...allRankings,
      stats: {
        total_states: states.length,
        total_rankings: allRankings.rankings.length,
        regional_distribution: regionalStats,
        government_distribution: governmentStats
      }
    });

  } catch (error) {
    console.error('Erro ao gerar rankings:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao gerar rankings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/rankings/:rankingId
 * Retorna um ranking específico
 */
router.get('/:rankingId', async (req, res) => {
  try {
    const { rankingId } = req.params;
    const { limit = 50 } = req.query;
    
    const states = await database.getStates();
    
    if (states.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhum estado cadastrado ainda',
        ranking: null
      });
    }

    const allRankings = Ranking.generateAllRankings(states);
    const ranking = allRankings.rankings.find(r => r.id === rankingId);

    if (!ranking) {
      return res.status(404).json({
        error: true,
        message: 'Ranking não encontrado',
        available_rankings: allRankings.rankings.map(r => ({
          id: r.id,
          title: r.title
        }))
      });
    }

    // Limitar resultados se especificado
    if (limit && limit !== 'all') {
      ranking.states = ranking.states.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      ranking: ranking,
      total_states: states.length,
      last_update: allRankings.lastUpdate
    });

  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao buscar ranking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/rankings/state/:stateId/position
 * Retorna a posição de um estado específico em todos os rankings
 */
router.get('/state/:stateId/position', async (req, res) => {
  try {
    const { stateId } = req.params;
    
    const states = await database.getStates();
    const targetState = states.find(s => s.id === stateId);

    if (!targetState) {
      return res.status(404).json({
        error: true,
        message: 'Estado não encontrado'
      });
    }

    const allRankings = Ranking.generateAllRankings(states);
    const statePositions = {};

    // Encontrar posição do estado em cada ranking
    allRankings.rankings.forEach(ranking => {
      const stateInRanking = ranking.states.find(s => s.id === stateId);
      if (stateInRanking) {
        statePositions[ranking.id] = {
          ranking_title: ranking.title,
          position: stateInRanking.position,
          total_states: ranking.states.length,
          value: stateInRanking.value,
          display_value: stateInRanking.displayValue,
          medal: stateInRanking.medal,
          description: stateInRanking.description
        };
      }
    });

    // Calcular estatísticas do estado
    const stateObj = new (require('../models/State'))(targetState);
    const stateStats = {
      name: targetState.name,
      region: targetState.region,
      government_type: targetState.government_type,
      overall_score: stateObj.calculateOverallScore(),
      authoritarianism_level: stateObj.getAuthoritarianismLevel(),
      description: stateObj.getStateDescription(),
      indicators: targetState.indicators,
      created_at: targetState.created_at,
      total_decisions: (targetState.decision_history || []).length
    };

    res.json({
      success: true,
      state: stateStats,
      positions: statePositions,
      summary: generatePositionSummary(statePositions, states.length)
    });

  } catch (error) {
    console.error('Erro ao buscar posições do estado:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao buscar posições',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/rankings/compare/:stateId1/:stateId2
 * Compara dois estados em todos os rankings
 */
router.get('/compare/:stateId1/:stateId2', async (req, res) => {
  try {
    const { stateId1, stateId2 } = req.params;
    
    const states = await database.getStates();
    const state1 = states.find(s => s.id === stateId1);
    const state2 = states.find(s => s.id === stateId2);

    if (!state1 || !state2) {
      return res.status(404).json({
        error: true,
        message: 'Um ou ambos os estados não foram encontrados'
      });
    }

    const allRankings = Ranking.generateAllRankings(states);
    const comparison = {};

    // Comparar posições em cada ranking
    allRankings.rankings.forEach(ranking => {
      const state1InRanking = ranking.states.find(s => s.id === stateId1);
      const state2InRanking = ranking.states.find(s => s.id === stateId2);

      if (state1InRanking && state2InRanking) {
        comparison[ranking.id] = {
          ranking_title: ranking.title,
          state1: {
            position: state1InRanking.position,
            value: state1InRanking.value,
            display_value: state1InRanking.displayValue
          },
          state2: {
            position: state2InRanking.position,
            value: state2InRanking.value,
            display_value: state2InRanking.displayValue
          },
          winner: state1InRanking.position < state2InRanking.position ? 'state1' : 'state2',
          difference: Math.abs(state1InRanking.position - state2InRanking.position)
        };
      }
    });

    // Estatísticas dos estados
    const state1Obj = new (require('../models/State'))(state1);
    const state2Obj = new (require('../models/State'))(state2);

    res.json({
      success: true,
      state1: {
        id: state1.id,
        name: state1.name,
        region: state1.region,
        government_type: state1.government_type,
        overall_score: state1Obj.calculateOverallScore(),
        indicators: state1.indicators
      },
      state2: {
        id: state2.id,
        name: state2.name,
        region: state2.region,
        government_type: state2.government_type,
        overall_score: state2Obj.calculateOverallScore(),
        indicators: state2.indicators
      },
      comparison: comparison,
      summary: generateComparisonSummary(comparison, state1, state2)
    });

  } catch (error) {
    console.error('Erro ao comparar estados:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao comparar estados',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/rankings/stats/overview
 * Retorna estatísticas gerais do jogo
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const states = await database.getStates();
    
    if (states.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhum estado cadastrado ainda',
        stats: {
          total_states: 0,
          total_decisions: 0,
          average_score: 0
        }
      });
    }

    // Calcular estatísticas gerais
    const totalDecisions = states.reduce((sum, state) => 
      sum + (state.decision_history || []).length, 0
    );

    const averageIndicators = {};
    const indicatorNames = ['economia', 'educacao', 'saude', 'seguranca', 'cultura', 'satisfacao_popular', 'corrupcao'];
    
    indicatorNames.forEach(indicator => {
      const sum = states.reduce((sum, state) => sum + state.indicators[indicator], 0);
      averageIndicators[indicator] = Math.round(sum / states.length);
    });

    const averageScore = states.reduce((sum, state) => {
      const stateObj = new (require('../models/State'))(state);
      return sum + stateObj.calculateOverallScore();
    }, 0) / states.length;

    // Estatísticas por região e governo
    const regionalStats = Ranking.generateRegionalStats(states);
    const governmentStats = Ranking.generateGovernmentStats(states);

    // Estados mais ativos (mais decisões)
    const mostActiveStates = states
      .map(state => ({
        id: state.id,
        name: state.name,
        decisions_count: (state.decision_history || []).length
      }))
      .sort((a, b) => b.decisions_count - a.decisions_count)
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        total_states: states.length,
        total_decisions: totalDecisions,
        average_score: Math.round(averageScore * 100) / 100,
        average_indicators: averageIndicators,
        regional_distribution: regionalStats,
        government_distribution: governmentStats,
        most_active_states: mostActiveStates,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro ao gerar estatísticas:', error);
    res.status(500).json({
      error: true,
      message: 'Erro interno do servidor ao gerar estatísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Gera resumo das posições de um estado
 */
function generatePositionSummary(positions, totalStates) {
  const positionValues = Object.values(positions).map(p => p.position);
  const averagePosition = positionValues.reduce((sum, pos) => sum + pos, 0) / positionValues.length;
  
  const topPositions = positionValues.filter(pos => pos <= 3).length;
  const topTenPercent = positionValues.filter(pos => pos <= Math.ceil(totalStates * 0.1)).length;

  let summary = '';
  
  if (averagePosition <= 3) {
    summary = '🏆 Estado de elite! Está entre os melhores na maioria dos rankings.';
  } else if (averagePosition <= totalStates * 0.2) {
    summary = '🥇 Excelente desempenho! Está bem posicionado na maioria dos rankings.';
  } else if (averagePosition <= totalStates * 0.5) {
    summary = '👍 Desempenho sólido! Está na média ou acima na maioria dos rankings.';
  } else if (averagePosition <= totalStates * 0.8) {
    summary = '📈 Tem potencial! Alguns indicadores precisam de atenção.';
  } else {
    summary = '💪 Muita coisa pra melhorar, mas todo mundo começou assim!';
  }

  return {
    text: summary,
    average_position: Math.round(averagePosition),
    top_3_positions: topPositions,
    top_10_percent_positions: topTenPercent,
    total_rankings: positionValues.length
  };
}

/**
 * Gera resumo da comparação entre dois estados
 */
function generateComparisonSummary(comparison, state1, state2) {
  const state1Wins = Object.values(comparison).filter(c => c.winner === 'state1').length;
  const state2Wins = Object.values(comparison).filter(c => c.winner === 'state2').length;
  
  let summary = '';
  
  if (state1Wins > state2Wins) {
    summary = `${state1.name} está se saindo melhor que ${state2.name} na maioria dos rankings (${state1Wins} vs ${state2Wins}).`;
  } else if (state2Wins > state1Wins) {
    summary = `${state2.name} está se saindo melhor que ${state1.name} na maioria dos rankings (${state2Wins} vs ${state1Wins}).`;
  } else {
    summary = `${state1.name} e ${state2.name} estão empatados! Competição acirrada.`;
  }

  return {
    text: summary,
    state1_wins: state1Wins,
    state2_wins: state2Wins,
    total_comparisons: Object.keys(comparison).length
  };
}

module.exports = router;

