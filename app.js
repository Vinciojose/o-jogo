/**
 * Aplicação principal do BrasilSim
 */

// Estado global da aplicação
const AppState = {
    currentPage: 'home',
    currentState: null,
    currentDecision: null,
    rankings: null,
    gameStats: null
};

/**
 * Inicialização da aplicação
 */
async function initApp() {
    console.log('🚀 Inicializando BrasilSim...');
    
    // Verificar conectividade com a API
    const isConnected = await initAPI();
    if (!isConnected) {
        showToast('Não foi possível conectar ao servidor. Algumas funcionalidades podem não funcionar.', 'warning');
    }

    // Carregar página inicial baseada na URL
    const urlParams = getURLParams();
    const initialPage = urlParams.page || 'home';
    
    // Verificar se o usuário já tem um estado
    const stateId = Storage.getStateId();
    if (stateId && initialPage === 'home') {
        showPage('dashboard');
    } else {
        showPage(initialPage);
    }

    // Configurar event listeners
    setupEventListeners();
    
    // Carregar estatísticas do jogo
    loadGameStats();
    
    console.log('✅ BrasilSim inicializado com sucesso!');
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Formulário de criação de estado
    const createForm = document.getElementById('create-state-form');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateState);
    }

    // Navegação por teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Fechar modais ou voltar
            const overlay = document.getElementById('loading-overlay');
            if (overlay && !overlay.classList.contains('hidden')) {
                showLoading(false);
            }
        }
    });

    // Atualizar ícones quando necessário
    document.addEventListener('DOMContentLoaded', () => {
        lucide.createIcons();
    });
}

/**
 * Navegação entre páginas
 */
function showPage(pageName) {
    // Ocultar todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Mostrar página selecionada
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = pageName;
        
        // Atualizar navegação
        updateNavigation(pageName);
        
        // Carregar conteúdo específico da página
        loadPageContent(pageName);
        
        // Atualizar URL
        updateURL(pageName);
    }
}

function updateNavigation(activePage) {
    // Atualizar botões de navegação
    document.querySelectorAll('.nav-btn, .mobile-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === activePage) {
            btn.classList.add('active');
        }
    });
}

async function loadPageContent(pageName) {
    switch (pageName) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'rankings':
            await loadRankings();
            break;
        case 'home':
            await loadGameStats();
            break;
    }
    
    // Recriar ícones Lucide após carregar conteúdo
    lucide.createIcons();
}

/**
 * Menu mobile
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

/**
 * Criação de estado
 */
async function handleCreateState(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const stateData = {
        name: formData.get('state-name') || document.getElementById('state-name').value,
        region: formData.get('state-region') || document.getElementById('state-region').value,
        government_type: document.querySelector('input[name="government-type"]:checked')?.value,
        player_id: Storage.getPlayerId()
    };

    // Validar dados
    if (!stateData.name || !stateData.region || !stateData.government_type) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    try {
        const response = await api.createState(stateData);
        
        if (response.success) {
            // Salvar ID do estado
            Storage.setStateId(response.state.id);
            AppState.currentState = response.state;
            
            showToast(response.message, 'success');
            
            // Redirecionar para dashboard
            setTimeout(() => {
                showPage('dashboard');
            }, 1500);
        }
    } catch (error) {
        console.error('Erro ao criar estado:', error);
        showToast(error.message || 'Erro ao criar estado. Tente novamente.', 'error');
    }
}

/**
 * Dashboard do estado
 */
async function loadDashboard() {
    const dashboardContent = document.getElementById('dashboard-content');
    if (!dashboardContent) return;

    const stateId = Storage.getStateId();
    
    if (!stateId) {
        dashboardContent.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="map-pin" class="w-8 h-8 text-gray-400"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Você ainda não criou um estado</h3>
                <p class="text-gray-600 mb-4">Crie seu estado fictício para começar a jogar!</p>
                <button onclick="showPage('create')" class="btn-primary">
                    <i data-lucide="plus-circle" class="w-4 h-4 mr-2"></i>
                    Criar Meu Estado
                </button>
            </div>
        `;
        return;
    }

    // Mostrar loading
    dashboardContent.innerHTML = createLoadingSkeleton('dashboard');

    try {
        const response = await api.getState(stateId);
        
        if (response.success) {
            AppState.currentState = response.state;
            dashboardContent.innerHTML = createStateDashboard(response.state);
            
            // Verificar se pode tomar decisão
            checkDecisionAvailability();
        }
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        dashboardContent.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="alert-circle" class="w-8 h-8 text-red-500"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Erro ao carregar estado</h3>
                <p class="text-gray-600 mb-4">${error.message}</p>
                <button onclick="loadDashboard()" class="btn-primary">
                    <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

/**
 * Verificar disponibilidade de decisão
 */
function checkDecisionAvailability() {
    const state = AppState.currentState;
    if (!state) return;

    const canDecide = canMakeDecision(state.last_decision_at);
    const decisionBtn = document.getElementById('decision-btn');
    
    if (canDecide) {
        if (decisionBtn) {
            decisionBtn.disabled = false;
            decisionBtn.innerHTML = `
                <i data-lucide="zap" class="w-4 h-4 mr-2"></i>
                Nova Decisão
            `;
        }
    } else {
        if (decisionBtn) {
            decisionBtn.disabled = true;
            decisionBtn.innerHTML = `
                <i data-lucide="clock" class="w-4 h-4 mr-2"></i>
                Aguarde...
            `;
        }
        
        const remainingTime = getTimeUntilNextDecision(state.last_decision_at);
        if (remainingTime) {
            const decisionSection = document.getElementById('decision-section');
            if (decisionSection) {
                decisionSection.innerHTML = createDecisionCooldown(remainingTime);
            }
        }
    }
}

/**
 * Carregar decisão aleatória
 */
async function loadRandomDecision() {
    const stateId = Storage.getStateId();
    if (!stateId) {
        showToast('Você precisa criar um estado primeiro!', 'error');
        return;
    }

    const decisionSection = document.getElementById('decision-section');
    if (!decisionSection) return;

    try {
        const response = await api.getRandomDecision(stateId);
        
        if (response.success) {
            AppState.currentDecision = response;
            decisionSection.innerHTML = createDecisionComponent(response);
        }
    } catch (error) {
        console.error('Erro ao carregar decisão:', error);
        
        if (error.message.includes('esperar')) {
            // Erro de cooldown
            showToast(error.message, 'warning');
            checkDecisionAvailability();
        } else {
            showToast('Erro ao carregar decisão. Tente novamente.', 'error');
        }
    }
}

/**
 * Selecionar opção de decisão
 */
function selectDecisionOption(optionIndex) {
    // Remover seleção anterior
    document.querySelectorAll('.decision-option').forEach(option => {
        option.classList.remove('border-blue-500', 'bg-blue-50');
        option.classList.add('border-gray-200');
    });

    // Selecionar nova opção
    const options = document.querySelectorAll('.decision-option');
    if (options[optionIndex]) {
        options[optionIndex].classList.remove('border-gray-200');
        options[optionIndex].classList.add('border-blue-500', 'bg-blue-50');
        
        // Marcar radio button
        const radio = options[optionIndex].querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
        
        // Habilitar botão de aplicar
        const applyBtn = document.getElementById('apply-decision-btn');
        if (applyBtn) {
            applyBtn.disabled = false;
        }
    }
}

/**
 * Aplicar decisão selecionada
 */
async function applySelectedDecision(decisionId) {
    const selectedOption = document.querySelector('input[name="decision-option"]:checked');
    if (!selectedOption) {
        showToast('Selecione uma opção antes de aplicar a decisão.', 'warning');
        return;
    }

    const stateId = Storage.getStateId();
    if (!stateId) {
        showToast('Estado não encontrado!', 'error');
        return;
    }

    try {
        const response = await api.applyDecision(stateId, {
            decision_id: decisionId,
            option_id: selectedOption.value
        });

        if (response.success) {
            showToast('Decisão aplicada com sucesso!', 'success');
            
            // Atualizar estado atual
            AppState.currentState = response.state;
            
            // Salvar timestamp da decisão
            Storage.setLastDecisionTime(new Date().toISOString());
            
            // Recarregar dashboard
            setTimeout(() => {
                loadDashboard();
            }, 1500);
        }
    } catch (error) {
        console.error('Erro ao aplicar decisão:', error);
        showToast(error.message || 'Erro ao aplicar decisão. Tente novamente.', 'error');
    }
}

/**
 * Rankings
 */
async function loadRankings() {
    const rankingsContent = document.getElementById('rankings-content');
    if (!rankingsContent) return;

    // Mostrar loading
    rankingsContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">Rankings Nacionais 🏆</h2>
            <p class="text-gray-600">Veja como os estados estão se saindo em diferentes indicadores</p>
        </div>
        ${createLoadingSkeleton('rankings')}
    `;

    try {
        const response = await api.getRankings(10);
        
        if (response.success) {
            AppState.rankings = response.rankings;
            
            rankingsContent.innerHTML = `
                <div class="mb-6">
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Rankings Nacionais 🏆</h2>
                    <p class="text-gray-600">Veja como os estados estão se saindo em diferentes indicadores</p>
                </div>
                
                ${response.rankings.length > 0 ? `
                    ${createRankingsGrid(response.rankings)}
                    
                    <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
                        <h3 class="text-xl font-semibold mb-4">Estatísticas Gerais</h3>
                        ${createGameStatsComponent(response.stats)}
                    </div>
                ` : `
                    <div class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="users" class="w-8 h-8 text-gray-400"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Nenhum estado cadastrado ainda</h3>
                        <p class="text-gray-600 mb-4">Seja o primeiro a criar um estado e aparecer nos rankings!</p>
                        <button onclick="showPage('create')" class="btn-primary">
                            <i data-lucide="plus-circle" class="w-4 h-4 mr-2"></i>
                            Criar Meu Estado
                        </button>
                    </div>
                `}
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar rankings:', error);
        rankingsContent.innerHTML = `
            <div class="text-center py-12">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="alert-circle" class="w-8 h-8 text-red-500"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Erro ao carregar rankings</h3>
                <p class="text-gray-600 mb-4">${error.message}</p>
                <button onclick="loadRankings()" class="btn-primary">
                    <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i>
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

/**
 * Mostrar detalhes de um ranking específico
 */
async function showRankingDetails(rankingId) {
    const rankingsContent = document.getElementById('rankings-content');
    if (!rankingsContent) return;

    // Mostrar loading
    rankingsContent.innerHTML = createLoadingSkeleton('rankings');

    try {
        const response = await api.getRanking(rankingId, 'all');
        
        if (response.success) {
            const ranking = response.ranking;
            
            rankingsContent.innerHTML = `
                <div class="mb-6">
                    <button onclick="loadRankings()" class="btn-secondary mb-4">
                        <i data-lucide="arrow-left" class="w-4 h-4 mr-2"></i>
                        Voltar aos Rankings
                    </button>
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">${ranking.title}</h2>
                    <p class="text-gray-600">${ranking.description}</p>
                </div>
                
                ${createRankingComponent(ranking)}
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        showToast('Erro ao carregar detalhes do ranking.', 'error');
        loadRankings();
    }
}

/**
 * Carregar estatísticas do jogo
 */
async function loadGameStats() {
    try {
        const response = await api.getGameStats();
        
        if (response.success) {
            AppState.gameStats = response.stats;
            updateGameStats(response.stats);
        }
    } catch (error) {
        console.warn('Não foi possível carregar estatísticas:', error);
    }
}

function updateGameStats(stats) {
    const elements = {
        'total-states': stats.total_states || 0,
        'total-decisions': stats.total_decisions || 0,
        'avg-score': stats.average_score || 0,
        'last-update': stats.last_updated ? formatRelativeTime(stats.last_updated) : '-'
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

/**
 * Funções utilitárias específicas da aplicação
 */
function resetGame() {
    if (confirm('Tem certeza que deseja resetar seu progresso? Esta ação não pode ser desfeita.')) {
        Storage.clearStateId();
        AppState.currentState = null;
        showToast('Progresso resetado com sucesso!', 'success');
        showPage('home');
    }
}

function shareState() {
    const state = AppState.currentState;
    if (!state) {
        showToast('Nenhum estado para compartilhar!', 'error');
        return;
    }

    const shareText = `Confira meu estado ${state.name} no BrasilSim! Pontuação: ${state.overall_score} pts`;
    
    if (navigator.share) {
        navigator.share({
            title: 'BrasilSim',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback para clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Texto copiado para a área de transferência!', 'success');
        });
    }
}

// Expor funções globalmente para uso nos event handlers HTML
window.showPage = showPage;
window.toggleMobileMenu = toggleMobileMenu;
window.loadRandomDecision = loadRandomDecision;
window.selectDecisionOption = selectDecisionOption;
window.applySelectedDecision = applySelectedDecision;
window.showRankingDetails = showRankingDetails;
window.resetGame = resetGame;
window.shareState = shareState;
window.initApp = initApp;

