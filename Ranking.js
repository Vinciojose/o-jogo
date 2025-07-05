/**
 * Modelo de Ranking
 * 
 * Calcula e organiza rankings dos estados por diferentes critérios
 */

class Ranking {
  constructor() {
    this.lastUpdate = null;
  }

  /**
   * Gera todos os rankings disponíveis
   */
  static generateAllRankings(states) {
    if (!states || states.length === 0) {
      return {
        rankings: [],
        lastUpdate: new Date().toISOString(),
        totalStates: 0
      };
    }

    const rankings = [
      // Rankings por indicador individual
      {
        id: 'economia',
        title: '💰 Maiores Economias',
        description: 'Estados com os melhores indicadores econômicos',
        states: Ranking.sortByIndicator(states, 'economia')
      },
      {
        id: 'educacao',
        title: '📚 Melhor Educação',
        description: 'Estados que mais investem em educação',
        states: Ranking.sortByIndicator(states, 'educacao')
      },
      {
        id: 'saude',
        title: '🏥 Melhor Saúde',
        description: 'Estados com os melhores sistemas de saúde',
        states: Ranking.sortByIndicator(states, 'saude')
      },
      {
        id: 'seguranca',
        title: '🛡️ Mais Seguros',
        description: 'Estados com menores índices de criminalidade',
        states: Ranking.sortByIndicator(states, 'seguranca')
      },
      {
        id: 'cultura',
        title: '🎭 Mais Culturais',
        description: 'Estados que mais valorizam a cultura',
        states: Ranking.sortByIndicator(states, 'cultura')
      },
      {
        id: 'satisfacao_popular',
        title: '😊 População Mais Feliz',
        description: 'Estados onde o povo está mais satisfeito',
        states: Ranking.sortByIndicator(states, 'satisfacao_popular')
      },
      
      // Rankings especiais
      {
        id: 'overall',
        title: '🏆 Melhores Estados',
        description: 'Ranking geral baseado em todos os indicadores',
        states: Ranking.sortByOverallScore(states)
      },
      {
        id: 'autoritarismo',
        title: '👑 Mais Autoritários',
        description: 'Estados com maior concentração de poder (baixa satisfação + alta corrupção)',
        states: Ranking.sortByAuthoritarianism(states)
      },
      {
        id: 'corrupcao_baixa',
        title: '✨ Menos Corruptos',
        description: 'Estados com menores níveis de corrupção',
        states: Ranking.sortByIndicator(states, 'corrupcao', false) // false = ordem crescente
      },
      {
        id: 'equilibrio',
        title: '⚖️ Mais Equilibrados',
        description: 'Estados com indicadores mais equilibrados entre si',
        states: Ranking.sortByBalance(states)
      },
      {
        id: 'crescimento',
        title: '📈 Em Maior Crescimento',
        description: 'Estados que mais melhoraram recentemente',
        states: Ranking.sortByGrowth(states)
      }
    ];

    return {
      rankings,
      lastUpdate: new Date().toISOString(),
      totalStates: states.length,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Ordena estados por um indicador específico
   */
  static sortByIndicator(states, indicator, descending = true) {
    return states
      .map(state => ({
        ...state,
        value: state.indicators[indicator],
        displayValue: `${state.indicators[indicator]}/100`
      }))
      .sort((a, b) => descending ? b.value - a.value : a.value - b.value)
      .map((state, index) => ({
        position: index + 1,
        id: state.id,
        name: state.name,
        region: state.region,
        government_type: state.government_type,
        value: state.value,
        displayValue: state.displayValue,
        medal: Ranking.getMedal(index + 1),
        description: Ranking.getPositionDescription(index + 1, states.length)
      }));
  }

  /**
   * Ordena estados por pontuação geral
   */
  static sortByOverallScore(states) {
    return states
      .map(state => {
        const stateObj = require('./State').fromDatabase ? 
          require('./State').fromDatabase(state) : 
          new (require('./State'))(state);
        
        return {
          ...state,
          value: stateObj.calculateOverallScore(),
          displayValue: `${stateObj.calculateOverallScore().toFixed(1)} pts`
        };
      })
      .sort((a, b) => b.value - a.value)
      .map((state, index) => ({
        position: index + 1,
        id: state.id,
        name: state.name,
        region: state.region,
        government_type: state.government_type,
        value: state.value,
        displayValue: state.displayValue,
        medal: Ranking.getMedal(index + 1),
        description: Ranking.getPositionDescription(index + 1, states.length)
      }));
  }

  /**
   * Ordena estados por nível de autoritarismo
   */
  static sortByAuthoritarianism(states) {
    return states
      .map(state => {
        const authScore = (100 - state.indicators.satisfacao_popular) + state.indicators.corrupcao;
        const stateObj = require('./State').fromDatabase ? 
          require('./State').fromDatabase(state) : 
          new (require('./State'))(state);
        
        return {
          ...state,
          value: authScore,
          displayValue: stateObj.getAuthoritarianismLevel()
        };
      })
      .sort((a, b) => b.value - a.value)
      .map((state, index) => ({
        position: index + 1,
        id: state.id,
        name: state.name,
        region: state.region,
        government_type: state.government_type,
        value: state.value,
        displayValue: state.displayValue,
        medal: Ranking.getMedal(index + 1),
        description: Ranking.getPositionDescription(index + 1, states.length)
      }));
  }

  /**
   * Ordena estados por equilíbrio (menor desvio padrão entre indicadores)
   */
  static sortByBalance(states) {
    return states
      .map(state => {
        const indicators = Object.values(state.indicators);
        const mean = indicators.reduce((sum, val) => sum + val, 0) / indicators.length;
        const variance = indicators.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / indicators.length;
        const standardDeviation = Math.sqrt(variance);
        
        return {
          ...state,
          value: 100 - standardDeviation, // Quanto menor o desvio, maior a pontuação
          displayValue: `${(100 - standardDeviation).toFixed(1)} pts`
        };
      })
      .sort((a, b) => b.value - a.value)
      .map((state, index) => ({
        position: index + 1,
        id: state.id,
        name: state.name,
        region: state.region,
        government_type: state.government_type,
        value: state.value,
        displayValue: state.displayValue,
        medal: Ranking.getMedal(index + 1),
        description: Ranking.getPositionDescription(index + 1, states.length)
      }));
  }

  /**
   * Ordena estados por crescimento (baseado no histórico de decisões)
   */
  static sortByGrowth(states) {
    return states
      .map(state => {
        // Calcular crescimento baseado nas últimas 5 decisões
        const recentDecisions = (state.decision_history || []).slice(-5);
        let totalGrowth = 0;
        
        recentDecisions.forEach(decision => {
          if (decision.effects) {
            Object.values(decision.effects).forEach(effect => {
              if (effect > 0) totalGrowth += effect;
            });
          }
        });
        
        return {
          ...state,
          value: totalGrowth,
          displayValue: `+${totalGrowth} pts`
        };
      })
      .sort((a, b) => b.value - a.value)
      .map((state, index) => ({
        position: index + 1,
        id: state.id,
        name: state.name,
        region: state.region,
        government_type: state.government_type,
        value: state.value,
        displayValue: state.displayValue,
        medal: Ranking.getMedal(index + 1),
        description: Ranking.getPositionDescription(index + 1, states.length)
      }));
  }

  /**
   * Retorna medalha baseada na posição
   */
  static getMedal(position) {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  }

  /**
   * Gera descrição da posição no ranking
   */
  static getPositionDescription(position, total) {
    const percentage = (position / total) * 100;
    
    if (position === 1) return 'Líder absoluto!';
    if (position <= 3) return 'No pódio!';
    if (percentage <= 10) return 'Entre os melhores';
    if (percentage <= 25) return 'Bem posicionado';
    if (percentage <= 50) return 'Na média';
    if (percentage <= 75) return 'Precisa melhorar';
    return 'Muita coisa pra fazer...';
  }

  /**
   * Gera estatísticas regionais
   */
  static generateRegionalStats(states) {
    const regions = {};
    
    states.forEach(state => {
      if (!regions[state.region]) {
        regions[state.region] = {
          name: state.region,
          count: 0,
          averageIndicators: {
            economia: 0,
            educacao: 0,
            saude: 0,
            seguranca: 0,
            cultura: 0,
            satisfacao_popular: 0,
            corrupcao: 0
          }
        };
      }
      
      regions[state.region].count++;
      Object.keys(state.indicators).forEach(indicator => {
        regions[state.region].averageIndicators[indicator] += state.indicators[indicator];
      });
    });

    // Calcular médias
    Object.keys(regions).forEach(regionName => {
      const region = regions[regionName];
      Object.keys(region.averageIndicators).forEach(indicator => {
        region.averageIndicators[indicator] = Math.round(
          region.averageIndicators[indicator] / region.count
        );
      });
    });

    return Object.values(regions);
  }

  /**
   * Gera estatísticas por tipo de governo
   */
  static generateGovernmentStats(states) {
    const govTypes = {};
    
    states.forEach(state => {
      if (!govTypes[state.government_type]) {
        govTypes[state.government_type] = {
          name: state.government_type,
          count: 0,
          averageIndicators: {
            economia: 0,
            educacao: 0,
            saude: 0,
            seguranca: 0,
            cultura: 0,
            satisfacao_popular: 0,
            corrupcao: 0
          }
        };
      }
      
      govTypes[state.government_type].count++;
      Object.keys(state.indicators).forEach(indicator => {
        govTypes[state.government_type].averageIndicators[indicator] += state.indicators[indicator];
      });
    });

    // Calcular médias
    Object.keys(govTypes).forEach(typeName => {
      const type = govTypes[typeName];
      Object.keys(type.averageIndicators).forEach(indicator => {
        type.averageIndicators[indicator] = Math.round(
          type.averageIndicators[indicator] / type.count
        );
      });
    });

    return Object.values(govTypes);
  }
}

module.exports = Ranking;

