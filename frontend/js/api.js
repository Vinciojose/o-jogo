/**
 * Módulo de comunicação com a API do BrasilSim
 */

const API_BASE_URL = 'http://localhost:3006/api';

class BrasilSimAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Faz uma requisição HTTP
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            showLoading(true);
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            showLoading(false);
        }
    }

    /**
     * Estados
     */
    async createState(stateData) {
        return this.request('/states', {
            method: 'POST',
            body: JSON.stringify(stateData)
        });
    }

    async getState(stateId) {
        return this.request(`/states/${stateId}`);
    }

    async getAllStates(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/states?${queryString}` : '/states';
        return this.request(endpoint);
    }

    async applyDecision(stateId, decisionData) {
        return this.request(`/states/${stateId}/decision`, {
            method: 'PATCH',
            body: JSON.stringify(decisionData)
        });
    }

    /**
     * Decisões
     */
    async getDecisions() {
        return this.request('/decisions');
    }

    async getDecision(decisionId) {
        return this.request(`/decisions/${decisionId}`);
    }

    async getRandomDecision(stateId) {
        return this.request(`/decisions/random/${stateId}`);
    }

    /**
     * Rankings
     */
    async getRankings(limit = 10) {
        const params = limit !== 'all' ? `?limit=${limit}` : '';
        return this.request(`/rankings${params}`);
    }

    async getRanking(rankingId, limit = 50) {
        const params = limit !== 'all' ? `?limit=${limit}` : '';
        return this.request(`/rankings/${rankingId}${params}`);
    }

    async getStatePositions(stateId) {
        return this.request(`/rankings/state/${stateId}/position`);
    }

    async compareStates(stateId1, stateId2) {
        return this.request(`/rankings/compare/${stateId1}/${stateId2}`);
    }

    async getGameStats() {
        return this.request('/rankings/stats/overview');
    }

    /**
     * Health check
     */
    async healthCheck() {
        return this.request('/health', { baseURL: 'http://localhost:3003' });
    }
}

// Instância global da API
const api = new BrasilSimAPI();

/**
 * Funções utilitárias para localStorage
 */
const Storage = {
    getPlayerId() {
        let playerId = localStorage.getItem('brasilsim_player_id');
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('brasilsim_player_id', playerId);
        }
        return playerId;
    },

    getStateId() {
        return localStorage.getItem('brasilsim_state_id');
    },

    setStateId(stateId) {
        localStorage.setItem('brasilsim_state_id', stateId);
    },

    clearStateId() {
        localStorage.removeItem('brasilsim_state_id');
    },

    getLastDecisionTime() {
        return localStorage.getItem('brasilsim_last_decision');
    },

    setLastDecisionTime(timestamp) {
        localStorage.setItem('brasilsim_last_decision', timestamp);
    }
};

/**
 * Funções de cache simples
 */
const Cache = {
    data: new Map(),
    
    set(key, value, ttl = 300000) { // 5 minutos por padrão
        this.data.set(key, {
            value,
            expires: Date.now() + ttl
        });
    },

    get(key) {
        const item = this.data.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.data.delete(key);
            return null;
        }
        
        return item.value;
    },

    clear() {
        this.data.clear();
    }
};

/**
 * Wrapper para requisições com cache
 */
async function cachedRequest(cacheKey, requestFn, ttl = 300000) {
    const cached = Cache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const result = await requestFn();
    Cache.set(cacheKey, result, ttl);
    return result;
}

/**
 * Verificar conectividade com a API
 */
async function checkAPIConnection() {
    try {
        await api.healthCheck();
        return true;
    } catch (error) {
        console.error('API não está disponível:', error);
        showToast('Erro de conexão com o servidor. Verifique se o backend está rodando.', 'error');
        return false;
    }
}

/**
 * Inicializar verificação de conectividade
 */
async function initAPI() {
    const isConnected = await checkAPIConnection();
    if (isConnected) {
        console.log('✅ Conectado à API do BrasilSim');
        
        // Carregar estatísticas iniciais
        try {
            const stats = await api.getGameStats();
            updateGameStats(stats.stats);
        } catch (error) {
            console.warn('Não foi possível carregar estatísticas:', error);
        }
    }
    return isConnected;
}

