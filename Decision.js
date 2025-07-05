/**
 * Modelo de Decisão Política
 * 
 * Representa uma decisão política que pode ser tomada pelos jogadores
 */

class Decision {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.options = data.options || [];
    this.category = data.category || 'geral';
    this.difficulty = data.difficulty || 'normal'; // easy, normal, hard
    this.created_at = data.created_at || new Date().toISOString();
  }

  /**
   * Valida a estrutura da decisão
   */
  validate() {
    const errors = [];

    if (!this.title || this.title.trim().length < 5) {
      errors.push('Título deve ter pelo menos 5 caracteres');
    }

    if (!this.description || this.description.trim().length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres');
    }

    if (!this.options || this.options.length < 2) {
      errors.push('Decisão deve ter pelo menos 2 opções');
    }

    // Validar cada opção
    this.options.forEach((option, index) => {
      if (!option.id || !option.text) {
        errors.push(`Opção ${index + 1} deve ter ID e texto`);
      }

      if (!option.effects || typeof option.effects !== 'object') {
        errors.push(`Opção ${index + 1} deve ter efeitos definidos`);
      }

      // Validar efeitos
      if (option.effects) {
        Object.keys(option.effects).forEach(indicator => {
          const value = option.effects[indicator];
          if (typeof value !== 'number' || value < -20 || value > 20) {
            errors.push(`Efeito ${indicator} na opção ${index + 1} deve ser um número entre -20 e 20`);
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera uma decisão aleatória baseada no estado atual
   */
  static generateRandomDecision(stateIndicators, availableDecisions) {
    // Filtrar decisões baseadas no contexto do estado
    let relevantDecisions = availableDecisions.filter(decision => {
      return Decision.isDecisionRelevant(decision, stateIndicators);
    });

    if (relevantDecisions.length === 0) {
      relevantDecisions = availableDecisions;
    }

    // Selecionar decisão aleatória
    const randomIndex = Math.floor(Math.random() * relevantDecisions.length);
    return relevantDecisions[randomIndex];
  }

  /**
   * Verifica se uma decisão é relevante para o estado atual
   */
  static isDecisionRelevant(decision, indicators) {
    // Lógica para determinar relevância baseada nos indicadores
    switch (decision.id) {
      case 'investimento_saude':
        return indicators.saude < 40;
      
      case 'seguranca_publica':
        return indicators.seguranca < 40;
      
      case 'corrupcao_escandalo':
        return indicators.corrupcao > 60;
      
      case 'cultura_nacional':
        return indicators.cultura < 50;
      
      default:
        return true; // Decisões gerais sempre são relevantes
    }
  }

  /**
   * Calcula o impacto total de uma opção
   */
  static calculateOptionImpact(option) {
    let totalImpact = 0;
    Object.values(option.effects).forEach(effect => {
      totalImpact += Math.abs(effect);
    });
    return totalImpact;
  }

  /**
   * Gera texto de resultado baseado nos efeitos
   */
  static generateResultText(option, effects) {
    const positiveEffects = [];
    const negativeEffects = [];

    Object.keys(effects).forEach(indicator => {
      const value = effects[indicator];
      const indicatorName = Decision.getIndicatorDisplayName(indicator);
      
      if (value > 0) {
        positiveEffects.push(`${indicatorName} +${value}`);
      } else if (value < 0) {
        negativeEffects.push(`${indicatorName} ${value}`);
      }
    });

    let resultText = `Você escolheu: "${option.text}"\n\n`;
    
    if (positiveEffects.length > 0) {
      resultText += `✅ Efeitos positivos: ${positiveEffects.join(', ')}\n`;
    }
    
    if (negativeEffects.length > 0) {
      resultText += `❌ Efeitos negativos: ${negativeEffects.join(', ')}\n`;
    }

    // Adicionar comentários baseados nos efeitos
    const comments = Decision.generateEffectComments(effects);
    if (comments.length > 0) {
      resultText += `\n💬 ${comments[Math.floor(Math.random() * comments.length)]}`;
    }

    return resultText;
  }

  /**
   * Gera comentários baseados nos efeitos da decisão
   */
  static generateEffectComments(effects) {
    const comments = [];

    if (effects.satisfacao_popular > 5) {
      comments.push('Seu povo tá felizão com essa decisão!');
      comments.push('A galera aprovou! Você ganhou uns pontos aí.');
    } else if (effects.satisfacao_popular < -5) {
      comments.push('Eita! Seu povo não curtiu nada essa decisão...');
      comments.push('A população tá pistola com você!');
    }

    if (effects.economia > 5) {
      comments.push('Boa! A economia deu uma melhorada.');
      comments.push('O PIB agradece essa decisão!');
    } else if (effects.economia < -5) {
      comments.push('Opa... a economia não gostou muito disso.');
      comments.push('O bolso do povo sentiu essa decisão...');
    }

    if (effects.corrupcao > 3) {
      comments.push('Hmm... parece que rolou umas negociatas aí...');
      comments.push('A transparência não foi o forte dessa decisão.');
    } else if (effects.corrupcao < -3) {
      comments.push('Parabéns! Você limpou a casa!');
      comments.push('A transparência aumentou! O povo reconhece.');
    }

    if (effects.seguranca > 5) {
      comments.push('As ruas ficaram mais seguras!');
      comments.push('A criminalidade deu uma diminuída.');
    } else if (effects.seguranca < -5) {
      comments.push('Opa... a segurança piorou um pouco.');
      comments.push('O povo tá com medo de sair de casa...');
    }

    return comments;
  }

  /**
   * Converte nome do indicador para exibição
   */
  static getIndicatorDisplayName(indicator) {
    const names = {
      economia: 'Economia',
      educacao: 'Educação',
      saude: 'Saúde',
      seguranca: 'Segurança',
      cultura: 'Cultura',
      satisfacao_popular: 'Satisfação Popular',
      corrupcao: 'Corrupção'
    };
    return names[indicator] || indicator;
  }

  /**
   * Converte para objeto JSON
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      options: this.options,
      category: this.category,
      difficulty: this.difficulty,
      created_at: this.created_at
    };
  }
}

module.exports = Decision;

