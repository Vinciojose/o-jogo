// BrasilSim - Frontend JavaScript
// Gerencia toda a lógica do frontend e comunicação com a API

// Estado global da aplicação
let currentState = null;
let currentDecision = null;

// URLs da API
const API_BASE = '/api';

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    console.log('🇧🇷 BrasilSim iniciado!');
    
    // Esconde o loading após um breve delay
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);
    
    // Carrega dados iniciais
    loadInitialData();
    
    // Configura event listeners
    setupEventListeners();
    
    // Verifica se há um estado salvo localmente
    checkSavedState();
});

// Carrega dados iniciais (regiões e tipos de governo)
async function loadInitialData() {
    try {
        // Carrega regiões
        const regionsResponse = await fetch(`${API_BASE}/regions`);
        const regionsData = await regionsResponse.json();
        
        if (regionsData.success) {
            const regionSelect = document.getElementById('state-region');
            regionsData.regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        }
        
        // Carrega tipos de governo
        const govResponse = await fetch(`${API_BASE}/government-types`);
        const govData = await govResponse.json();
        
        if (govData.success) {
            const govSelect = document.getElementById('state-government');
            govData.government_types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                govSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        showNotification('Erro ao carregar dados iniciais', 'error');
    }
}

// Configura event listeners
function setupEventListeners() {
    // Formulário de criação de estado
    const createForm = document.getElementById('create-state-form');
    createForm.addEventListener('submit', handleCreateState);
}

// Verifica se há um estado salvo localmente
function checkSavedState() {
    const savedStateId = localStorage.getItem('brasilsim-state-id');
    if (savedStateId) {
        loadState(savedStateId);
    }
}

// Manipula a criação de estado
async function handleCreateState(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const stateData = {
        name: formData.get('name'),
        region: formData.get('region'),
        government_type: formData.get('government_type')
    };
    
    // Validação básica
    if (!stateData.name || !stateData.region || !stateData.government_type) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/states`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(stateData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Salva o ID do estado localmente
            localStorage.setItem('brasilsim-state-id', data.state.id);
            
            // Carrega o estado criado
            currentState = data.state;
            
            showNotification(data.message, 'success');
            showDashboard();
        } else {
            showNotification(data.error || 'Erro ao criar estado', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao criar estado:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
        showLoading(false);
    }
}

// Carrega um estado pelo ID
async function loadState(stateId) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/states/${stateId}`);
        const data = await response.json();
        
        if (data.success) {
            currentState = data.state;
            showDashboard();
            updateDashboard();
        } else {
            // Estado não encontrado, limpa localStorage
            localStorage.removeItem('brasilsim-state-id');
            showNotification('Estado não encontrado', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao carregar estado:', error);
        showNotification('Erro ao carregar estado', 'error');
    } finally {
        showLoading(false);
    }
}

// Atualiza o dashboard com os dados do estado
function updateDashboard() {
    if (!currentState) return;
    
    // Atualiza informações do estado
    document.getElementById('state-title').textContent = currentState.name;
    document.getElementById('state-info').textContent = 
        `${currentState.region} • ${currentState.government_type}`;
    document.getElementById('decisions-count').textContent = currentState.decisions_count;
    
    // Atualiza indicadores
    const indicators = currentState.indicators;
    updateIndicator('economy', indicators.economy);
    updateIndicator('education', indicators.education);
    updateIndicator('health', indicators.health);
    updateIndicator('security', indicators.security);
    updateIndicator('culture', indicators.culture);
    updateIndicator('satisfaction', indicators.satisfaction);
    updateIndicator('corruption', indicators.corruption);
    
    // Atualiza mensagem de status
    updateStatusMessage();
}

// Atualiza um indicador específico
function updateIndicator(name, value) {
    const valueElement = document.getElementById(`${name}-value`);
    const barElement = document.getElementById(`${name}-bar`);
    
    if (valueElement && barElement) {
        valueElement.textContent = value;
        barElement.style.width = `${value}%`;
        
        // Adiciona animação
        valueElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
            valueElement.style.transform = 'scale(1)';
        }, 200);
    }
}

// Atualiza a mensagem de status
function updateStatusMessage() {
    const statusElement = document.getElementById('status-message');
    if (!statusElement || !currentState) return;
    
    const indicators = currentState.indicators;
    const avg = (indicators.satisfaction + indicators.economy + indicators.education + indicators.health) / 4;
    
    let message = '';
    let className = '';
    
    if (avg >= 80) {
        message = 'Seu povo está feliz da vida! 🎉';
        className = 'text-green-600';
    } else if (avg >= 60) {
        message = 'As coisas estão indo bem por aí! 👍';
        className = 'text-blue-600';
    } else if (avg >= 40) {
        message = 'O povo está meio desconfiado... 🤔';
        className = 'text-yellow-600';
    } else if (avg >= 20) {
        message = 'Seu povo tá pistola com você! 😠';
        className = 'text-orange-600';
    } else {
        message = 'Revolução à vista! Cuidado! 🔥';
        className = 'text-red-600';
    }
    
    statusElement.textContent = message;
    statusElement.className = `text-lg font-semibold ${className}`;
}

// Carrega uma nova decisão
async function loadDecision() {
    if (!currentState) return;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/states/${currentState.id}/current-decision`);
        const data = await response.json();
        
        if (data.success) {
            currentDecision = data.decision;
            displayDecision(currentDecision);
        } else {
            showNotification(data.error || 'Erro ao carregar decisão', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao carregar decisão:', error);
        showNotification('Erro ao carregar decisão', 'error');
    } finally {
        showLoading(false);
    }
}

// Exibe uma decisão na interface
function displayDecision(decision) {
    const contentDiv = document.getElementById('decision-content');
    
    const html = `
        <div class="mb-6">
            <h4 class="text-xl font-bold text-gray-800 mb-3">${decision.title}</h4>
            <p class="text-gray-600 mb-6">${decision.description}</p>
        </div>
        
        <div class="space-y-3">
            ${decision.options.map((option, index) => `
                <button 
                    onclick="applyDecision(${index})"
                    class="w-full text-left p-4 border border-gray-300 rounded-lg hover:border-brasil-green hover:bg-green-50 transition-colors"
                >
                    <div class="font-semibold text-gray-800">${option.text}</div>
                    ${option.effects ? `
                        <div class="text-sm text-gray-500 mt-2">
                            Efeitos: ${formatEffects(option.effects)}
                        </div>
                    ` : ''}
                </button>
            `).join('')}
        </div>
    `;
    
    contentDiv.innerHTML = html;
}

// Formata os efeitos de uma decisão para exibição
function formatEffects(effects) {
    const effectNames = {
        economy: 'Economia',
        education: 'Educação',
        health: 'Saúde',
        security: 'Segurança',
        culture: 'Cultura',
        satisfaction: 'Satisfação',
        corruption: 'Corrupção'
    };
    
    return Object.entries(effects)
        .map(([key, value]) => {
            const name = effectNames[key] || key;
            const sign = value > 0 ? '+' : '';
            return `${name} ${sign}${value}`;
        })
        .join(', ');
}

// Aplica uma decisão
async function applyDecision(optionIndex) {
    if (!currentState || !currentDecision) return;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/states/${currentState.id}/decision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ option_index: optionIndex })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Atualiza o estado atual
            currentState = data.state;
            
            // Atualiza a interface
            updateDashboard();
            
            // Mostra resultado da decisão
            showDecisionResult(data);
            
            showNotification('Decisão aplicada com sucesso!', 'success');
        } else {
            showNotification(data.error || 'Erro ao aplicar decisão', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao aplicar decisão:', error);
        showNotification('Erro ao aplicar decisão', 'error');
    } finally {
        showLoading(false);
    }
}

// Mostra o resultado de uma decisão
function showDecisionResult(data) {
    const contentDiv = document.getElementById('decision-content');
    
    const html = `
        <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h4 class="text-lg font-bold text-green-800 mb-2">Decisão Tomada!</h4>
            <p class="text-green-700 mb-4">${data.chosen_option.text}</p>
            <p class="text-sm text-green-600">
                Efeitos: ${formatEffects(data.chosen_option.effects)}
            </p>
        </div>
        
        <button 
            onclick="loadDecision()" 
            class="bg-brasil-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
            Próxima Decisão
        </button>
    `;
    
    contentDiv.innerHTML = html;
}

// Carrega e exibe rankings
async function loadRankings() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE}/rankings`);
        const data = await response.json();
        
        if (data.success) {
            displayRankings(data.rankings);
        } else {
            showNotification(data.error || 'Erro ao carregar rankings', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao carregar rankings:', error);
        showNotification('Erro ao carregar rankings', 'error');
    } finally {
        showLoading(false);
    }
}

// Exibe os rankings na interface
function displayRankings(rankings) {
    const contentDiv = document.getElementById('rankings-content');
    
    const rankingNames = {
        economia: { name: 'Economia', icon: '💰' },
        educacao: { name: 'Educação', icon: '📚' },
        saude: { name: 'Saúde', icon: '🏥' },
        seguranca: { name: 'Segurança', icon: '🛡️' },
        cultura: { name: 'Cultura', icon: '🎭' },
        satisfacao: { name: 'Satisfação', icon: '😊' },
        menos_corrupto: { name: 'Menos Corrupto', icon: '✨' },
        geral: { name: 'Ranking Geral', icon: '🏆' }
    };
    
    const html = Object.entries(rankings).map(([category, states]) => {
        const info = rankingNames[category] || { name: category, icon: '📊' };
        
        return `
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="flex items-center mb-4">
                    <span class="text-2xl mr-3">${info.icon}</span>
                    <h3 class="text-xl font-bold text-gray-800">${info.name}</h3>
                </div>
                
                <div class="space-y-3">
                    ${states.slice(0, 5).map(entry => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center">
                                <span class="font-bold text-lg text-gray-600 w-8">${entry.position}º</span>
                                <span class="font-semibold text-gray-800">${entry.state.name}</span>
                            </div>
                            <span class="font-bold text-brasil-green">${entry.score || entry.state.indicators[category] || 'N/A'}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${states.length === 0 ? '<p class="text-gray-500 text-center py-4">Nenhum estado encontrado</p>' : ''}
            </div>
        `;
    }).join('');
    
    contentDiv.innerHTML = html;
}

// Navegação entre telas
function showHome() {
    hideAllScreens();
    document.getElementById('home-screen').classList.remove('hidden');
}

function showDashboard() {
    hideAllScreens();
    document.getElementById('dashboard-screen').classList.remove('hidden');
    if (currentState) {
        updateDashboard();
    }
}

function showRankings() {
    hideAllScreens();
    document.getElementById('rankings-screen').classList.remove('hidden');
    loadRankings();
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.add('hidden'));
}

// Utilitários
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.style.display = 'flex';
    } else {
        loading.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Cria elemento de notificação
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    // Define cores baseadas no tipo
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black'
    };
    
    notification.className += ` ${colors[type] || colors.info}`;
    notification.textContent = message;
    
    // Adiciona ao DOM
    document.body.appendChild(notification);
    
    // Anima entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove após 5 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Função para resetar o jogo (útil para testes)
function resetGame() {
    localStorage.removeItem('brasilsim-state-id');
    currentState = null;
    currentDecision = null;
    showHome();
    showNotification('Jogo resetado!', 'info');
}

// Expõe funções globais para debug
window.brasilsim = {
    resetGame,
    currentState: () => currentState,
    loadState,
    showDashboard,
    showRankings
};

