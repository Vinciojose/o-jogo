/**
 * Configuração do Banco de Dados
 * 
 * Por enquanto usando sistema de arquivos JSON para simplicidade.
 * Pode ser facilmente migrado para PostgreSQL posteriormente.
 */

const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.statesFile = path.join(this.dataDir, 'states.json');
    this.decisionsFile = path.join(this.dataDir, 'decisions.json');
    this.init();
  }

  async init() {
    try {
      // Criar diretório de dados se não existir
      await fs.mkdir(this.dataDir, { recursive: true });
      
      // Inicializar arquivos se não existirem
      await this.initFile(this.statesFile, []);
      await this.initFile(this.decisionsFile, this.getInitialDecisions());
      
      console.log('📁 Sistema de arquivos inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
    }
  }

  async initFile(filePath, defaultData) {
    try {
      await fs.access(filePath);
    } catch {
      // Arquivo não existe, criar com dados padrão
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  async readFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Erro ao ler arquivo ${filePath}:`, error);
      return null;
    }
  }

  async writeFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Erro ao escrever arquivo ${filePath}:`, error);
      return false;
    }
  }

  // Estados
  async getStates() {
    return await this.readFile(this.statesFile) || [];
  }

  async saveStates(states) {
    return await this.writeFile(this.statesFile, states);
  }

  async getStateById(id) {
    const states = await this.getStates();
    return states.find(state => state.id === id);
  }

  async createState(stateData) {
    const states = await this.getStates();
    const newState = {
      id: this.generateId(),
      ...stateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    states.push(newState);
    await this.saveStates(states);
    return newState;
  }

  async updateState(id, updates) {
    const states = await this.getStates();
    const index = states.findIndex(state => state.id === id);
    
    if (index === -1) return null;
    
    states[index] = {
      ...states[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this.saveStates(states);
    return states[index];
  }

  // Decisões
  async getDecisions() {
    return await this.readFile(this.decisionsFile) || [];
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getInitialDecisions() {
    return [
      {
        id: 'trabalho_infantil',
        title: 'Proposta: Reduzir idade mínima para trabalho formal',
        description: 'O Congresso está debatendo uma proposta para reduzir a idade mínima para trabalho formal de 16 para 14 anos.',
        options: [
          {
            id: 'aprovar',
            text: 'Aprovar - "Vamos dar oportunidade para a galera jovem!"',
            effects: {
              economia: 5,
              educacao: -3,
              satisfacao_popular: -2
            }
          },
          {
            id: 'rejeitar',
            text: 'Rejeitar - "Criança tem que estudar, não trabalhar!"',
            effects: {
              educacao: 4,
              economia: -2,
              satisfacao_popular: 3
            }
          }
        ]
      },
      {
        id: 'investimento_saude',
        title: 'Crise na Saúde: Falta de leitos hospitalares',
        description: 'Os hospitais estão lotados e a população está reclamando. O que fazer?',
        options: [
          {
            id: 'investir_massivo',
            text: 'Investimento massivo - "Saúde não tem preço!"',
            effects: {
              saude: 8,
              economia: -4,
              satisfacao_popular: 6
            }
          },
          {
            id: 'parcerias_privadas',
            text: 'Parcerias com setor privado - "Vamos otimizar os recursos"',
            effects: {
              saude: 4,
              economia: 2,
              satisfacao_popular: -1,
              corrupcao: 2
            }
          },
          {
            id: 'nao_fazer_nada',
            text: 'Aguardar melhoria natural - "A situação vai se resolver sozinha"',
            effects: {
              saude: -3,
              satisfacao_popular: -5,
              corrupcao: 1
            }
          }
        ]
      },
      {
        id: 'seguranca_publica',
        title: 'Onda de violência: Como reagir?',
        description: 'A criminalidade aumentou 30% no último mês. Seu povo tá pistola!',
        options: [
          {
            id: 'mais_policiamento',
            text: 'Aumentar policiamento ostensivo - "Bandido bom é bandido preso!"',
            effects: {
              seguranca: 6,
              economia: -3,
              satisfacao_popular: 4,
              corrupcao: 1
            }
          },
          {
            id: 'programas_sociais',
            text: 'Investir em programas sociais - "Vamos atacar a raiz do problema"',
            effects: {
              seguranca: 3,
              educacao: 2,
              cultura: 3,
              economia: -2,
              satisfacao_popular: 2
            }
          }
        ]
      },
      {
        id: 'cultura_nacional',
        title: 'Festival de Cultura: Investir ou não?',
        description: 'Artistas estão pedindo verba para um grande festival cultural. Vale a pena?',
        options: [
          {
            id: 'investir_cultura',
            text: 'Patrocinar o festival - "Cultura é a alma do povo!"',
            effects: {
              cultura: 7,
              economia: -2,
              satisfacao_popular: 4
            }
          },
          {
            id: 'negar_verba',
            text: 'Negar verba - "Temos prioridades mais importantes"',
            effects: {
              economia: 1,
              cultura: -4,
              satisfacao_popular: -2
            }
          }
        ]
      },
      {
        id: 'corrupcao_escandalo',
        title: 'Escândalo de Corrupção: Como lidar?',
        description: 'Um esquema de corrupção foi descoberto no seu governo. A mídia tá em cima!',
        options: [
          {
            id: 'investigacao_completa',
            text: 'Investigação completa e transparente - "Vamos limpar a casa!"',
            effects: {
              corrupcao: -6,
              satisfacao_popular: 5,
              economia: -1
            }
          },
          {
            id: 'abafar_caso',
            text: 'Tentar abafar o caso - "Isso vai passar..."',
            effects: {
              corrupcao: 3,
              satisfacao_popular: -8,
              economia: 1
            }
          },
          {
            id: 'bode_expiatorio',
            text: 'Culpar subordinados - "Eu não sabia de nada!"',
            effects: {
              corrupcao: -1,
              satisfacao_popular: -3,
              economia: 0
            }
          }
        ]
      }
    ];
  }
}

// Singleton instance
const database = new Database();

module.exports = database;

