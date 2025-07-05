/**
 * Modelo de Estado
 * 
 * Representa um estado fictício no jogo BrasilSim
 */

class State {
  constructor(data = {}) {
    // Informações básicas do estado
    this.id = data.id || null;
    this.name = data.name || '';
    this.region = data.region || '';
    this.government_type = data.government_type || '';
    this.player_id = data.player_id || null; // ID do jogador (localStorage)
    
    // Indicadores do estado (0-100)
    this.indicators = {
      economia: (data.indicators && data.indicators.economia) || 50,
      educacao: (data.indicators && data.indicators.educacao) || 50,
      saude: (data.indicators && data.indicators.saude) || 50,
      seguranca: (data.indicators && data.indicators.seguranca) || 50,
      cultura: (data.indicators && data.indicators.cultura) || 50,
      satisfacao_popular: (data.indicators && data.indicators.satisfacao_popular) || 50,
      corrupcao: (data.indicators && data.indicators.corrupcao) || 50
    };
    
    // Histórico de decisões
    this.decision_history = data.decision_history || [];
    
    // Timestamps
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
    this.last_decision_at = data.last_decision_at || null;
  }

  /**
   * Valida os dados do estado
   */
  validate() {
    const errors = [];

    // Validar nome
    if (!this.name || this.name.trim().length < 3) {
      errors.push('Nome do estado deve ter pelo menos 3 caracteres');
    }

    if (this.name && this.name.length > 50) {
      errors.push('Nome do estado deve ter no máximo 50 caracteres');
    }

    // Validar região
    const validRegions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
    if (!this.region || !validRegions.includes(this.region)) {
      errors.push('Região deve ser uma das opções válidas: ' + validRegions.join(', '));
    }

    // Validar tipo de governo
    const validGovTypes = ['Democracia', 'Tecnocracia', 'Coronelismo'];
    if (!this.government_type || !validGovTypes.includes(this.government_type)) {
      errors.push('Tipo de governo deve ser uma das opções válidas: ' + validGovTypes.join(', '));
    }

    // Validar indicadores
    Object.keys(this.indicators).forEach(indicator => {
      const value = this.indicators[indicator];
      if (typeof value !== 'number' || value < 0 || value > 100) {
        errors.push(`Indicador ${indicator} deve ser um número entre 0 e 100`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Aplica os efeitos de uma decisão política
   */
  applyDecisionEffects(effects) {
    Object.keys(effects).forEach(indicator => {
      if (this.indicators.hasOwnProperty(indicator)) {
        const newValue = this.indicators[indicator] + effects[indicator];
        // Manter valores entre 0 e 100
        this.indicators[indicator] = Math.max(0, Math.min(100, newValue));
      }
    });

    this.updated_at = new Date().toISOString();
    this.last_decision_at = new Date().toISOString();
  }

  /**
   * Adiciona uma decisão ao histórico
   */
  addDecisionToHistory(decisionId, optionId, effects) {
    this.decision_history.push({
      decision_id: decisionId,
      option_id: optionId,
      effects: effects,
      timestamp: new Date().toISOString()
    });

    // Manter apenas as últimas 50 decisões
    if (this.decision_history.length > 50) {
      this.decision_history = this.decision_history.slice(-50);
    }
  }

  /**
   * Calcula pontuação geral do estado
   */
  calculateOverallScore() {
    const weights = {
      economia: 0.2,
      educacao: 0.15,
      saude: 0.15,
      seguranca: 0.15,
      cultura: 0.1,
      satisfacao_popular: 0.2,
      corrupcao: -0.05 // Corrupção diminui a pontuação
    };

    let score = 0;
    Object.keys(weights).forEach(indicator => {
      score += this.indicators[indicator] * weights[indicator];
    });

    return Math.round(score * 100) / 100; // Arredondar para 2 casas decimais
  }

  /**
   * Determina o nível de autoritarismo
   */
  getAuthoritarianismLevel() {
    // Autoritarismo = baixa satisfação popular + alta corrupção
    const authScore = (100 - this.indicators.satisfacao_popular) + this.indicators.corrupcao;
    
    if (authScore >= 150) return 'Ditadura';
    if (authScore >= 120) return 'Autoritário';
    if (authScore >= 80) return 'Populista';
    if (authScore >= 40) return 'Democrático';
    return 'Muito Democrático';
  }

  /**
   * Gera descrição do estado atual
   */
  getStateDescription() {
    const score = this.calculateOverallScore();
    const authLevel = this.getAuthoritarianismLevel();
    
    let description = `${this.name} é um estado `;
    
    if (score >= 80) description += 'próspero e bem administrado';
    else if (score >= 60) description += 'em desenvolvimento';
    else if (score >= 40) description += 'com desafios moderados';
    else if (score >= 20) description += 'em crise';
    else description += 'em colapso total';
    
    description += ` da região ${this.region}, com governo ${this.government_type.toLowerCase()}`;
    description += ` e características ${authLevel.toLowerCase()}.`;
    
    // Adicionar observações específicas
    const observations = [];
    
    if (this.indicators.economia >= 80) observations.push('economia forte');
    else if (this.indicators.economia <= 20) observations.push('economia em colapso');
    
    if (this.indicators.corrupcao >= 80) observations.push('corrupção generalizada');
    else if (this.indicators.corrupcao <= 20) observations.push('baixos níveis de corrupção');
    
    if (this.indicators.satisfacao_popular >= 80) observations.push('população muito satisfeita');
    else if (this.indicators.satisfacao_popular <= 20) observations.push('população revoltada');
    
    if (observations.length > 0) {
      description += ` Destaca-se pela ${observations.join(', ')}.`;
    }
    
    return description;
  }

  /**
   * Converte para objeto JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      region: this.region,
      government_type: this.government_type,
      player_id: this.player_id,
      indicators: this.indicators,
      decision_history: this.decision_history,
      created_at: this.created_at,
      updated_at: this.updated_at,
      last_decision_at: this.last_decision_at,
      overall_score: this.calculateOverallScore(),
      authoritarianism_level: this.getAuthoritarianismLevel(),
      description: this.getStateDescription()
    };
  }

  /**
   * Cria instância a partir de dados do banco
   */
  static fromDatabase(data) {
    return new State(data);
  }
}

module.exports = State;

