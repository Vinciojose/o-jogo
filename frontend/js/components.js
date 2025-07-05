/**
 * Componentes reutilizáveis para o BrasilSim
 */

/**
 * Componente de indicador
 */
function createIndicatorComponent(indicator, value, showDetails = true) {
    const name = getIndicatorName(indicator);
    const icon = getIndicatorIcon(indicator);
    const status = getIndicatorStatus(value);
    const color = getIndicatorColor(value);
    
    return `
        <div class="indicator-item bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <i data-lucide="${icon}" class="w-5 h-5 ${color}"></i>
                    <span class="font-medium text-gray-800">${name}</span>
                </div>
                <span class="text-lg font-bold ${color}">${value}/100</span>
            </div>
            
            <div class="indicator-bar mb-2">
                <div class="indicator-fill ${indicator}" style="width: ${value}%"></div>
            </div>
            
            ${showDetails ? `
                <div class="flex justify-between items-center text-sm">
                    <span class="${color}">${status}</span>
                    <span class="text-gray-500">${getIndicatorAdvice(indicator, value)}</span>
                </div>
            ` : ''}
        </div>
    `;
}

function getIndicatorAdvice(indicator, value) {
    if (value >= 80) return 'Excelente!';
    if (value >= 60) return 'Bom trabalho';
    if (value >= 40) return 'Pode melhorar';
    if (value >= 20) return 'Precisa atenção';
    return 'Crítico!';
}

/**
 * Componente de dashboard do estado
 */
function createStateDashboard(state) {
    const indicators = Object.keys(state.indicators)
        .map(indicator => createIndicatorComponent(indicator, state.indicators[indicator]))
        .join('');

    return `
        <div class="space-y-6">
            <!-- Cabeçalho do Estado -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">${state.name}</h2>
                        <div class="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span class="badge badge-info">${state.region}</span>
                            <span class="badge badge-info">${state.government_type}</span>
                            <span class="badge ${getScoreBadgeClass(state.overall_score)}">${state.overall_score} pts</span>
                        </div>
                    </div>
                    <div class="mt-4 md:mt-0 space-y-2 md:space-y-0 md:space-x-2 flex flex-col md:flex-row">
                        <button onclick="loadRandomDecision()" class="btn-primary" id="decision-btn">
                            <i data-lucide="zap" class="w-4 h-4 mr-2"></i>
                            Nova Decisão
                        </button>
                        <button onclick="showPage('rankings')" class="btn-secondary">
                            <i data-lucide="trophy" class="w-4 h-4 mr-2"></i>
                            Ver Rankings
                        </button>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-4">
                    <p class="text-gray-700">${state.description}</p>
                </div>
            </div>

            <!-- Indicadores -->
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-semibold mb-4">Indicadores do Estado</h3>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${indicators}
                </div>
            </div>

            <!-- Histórico de Decisões -->
            ${createDecisionHistory(state.decision_history)}

            <!-- Próxima Decisão -->
            <div id="decision-section"></div>
        </div>
    `;
}

function getScoreBadgeClass(score) {
    if (score >= 70) return 'badge-success';
    if (score >= 50) return 'badge-warning';
    return 'badge-danger';
}

/**
 * Componente de histórico de decisões
 */
function createDecisionHistory(history) {
    if (!history || history.length === 0) {
        return `
            <div class="bg-white rounded-xl shadow-lg p-6">
                <h3 class="text-xl font-semibold mb-4">Histórico de Decisões</h3>
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="clock" class="w-12 h-12 mx-auto mb-4 text-gray-300"></i>
                    <p>Nenhuma decisão tomada ainda.</p>
                    <p class="text-sm">Tome sua primeira decisão política!</p>
                </div>
            </div>
        `;
    }

    const recentDecisions = history.slice(-5).reverse();
    const decisionsHTML = recentDecisions.map(decision => `
        <div class="border-l-4 border-blue-500 pl-4 py-2">
            <div class="flex justify-between items-start mb-1">
                <span class="font-medium text-gray-800">Decisão ${decision.decision_id}</span>
                <span class="text-xs text-gray-500">${formatRelativeTime(decision.timestamp)}</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">Opção: ${decision.option_id}</div>
            <div class="flex flex-wrap gap-1">
                ${Object.keys(decision.effects).map(indicator => {
                    const effect = decision.effects[indicator];
                    const color = effect > 0 ? 'text-green-600' : 'text-red-600';
                    const sign = effect > 0 ? '+' : '';
                    return `<span class="text-xs ${color}">${getIndicatorName(indicator)} ${sign}${effect}</span>`;
                }).join('')}
            </div>
        </div>
    `).join('');

    return `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Histórico de Decisões</h3>
                <span class="text-sm text-gray-500">${history.length} decisões tomadas</span>
            </div>
            <div class="space-y-3">
                ${decisionsHTML}
            </div>
            ${history.length > 5 ? `
                <div class="mt-4 text-center">
                    <button onclick="showFullHistory()" class="text-blue-600 hover:text-blue-800 text-sm">
                        Ver histórico completo (${history.length - 5} mais)
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Componente de decisão política
 */
function createDecisionComponent(decisionData) {
    const { decision, context } = decisionData;
    
    const optionsHTML = decision.options.map((option, index) => `
        <div class="decision-option border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer" 
             onclick="selectDecisionOption(${index})">
            <div class="flex items-start justify-between mb-2">
                <h4 class="font-medium text-gray-800">${option.text}</h4>
                <input type="radio" name="decision-option" value="${option.id}" class="mt-1">
            </div>
            
            <div class="text-sm text-gray-600 mb-3">
                <strong>Efeitos:</strong>
            </div>
            
            <div class="grid grid-cols-2 gap-2 text-xs">
                ${Object.keys(option.effects).map(indicator => {
                    const effect = option.effects[indicator];
                    const color = effect > 0 ? 'text-green-600' : effect < 0 ? 'text-red-600' : 'text-gray-500';
                    const sign = effect > 0 ? '+' : '';
                    return `
                        <div class="flex justify-between">
                            <span>${getIndicatorName(indicator)}:</span>
                            <span class="${color} font-medium">${sign}${effect}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');

    return `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-2">${decision.title}</h3>
                <p class="text-gray-700 mb-4">${decision.description}</p>
                
                ${context && context.messages.length > 0 ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div class="flex items-start space-x-2">
                            <i data-lucide="info" class="w-4 h-4 text-yellow-600 mt-0.5"></i>
                            <div class="text-sm text-yellow-800">
                                ${context.messages.map(msg => `<p>${msg}</p>`).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="space-y-4 mb-6">
                ${optionsHTML}
            </div>

            <div class="flex justify-between items-center">
                <div class="text-sm text-gray-500">
                    Urgência: <span class="font-medium ${getUrgencyColor(context?.urgency)}">${context?.urgency || 'MÉDIA'}</span>
                </div>
                <button onclick="applySelectedDecision('${decision.id}')" class="btn-primary" disabled id="apply-decision-btn">
                    <i data-lucide="check" class="w-4 h-4 mr-2"></i>
                    Aplicar Decisão
                </button>
            </div>
        </div>
    `;
}

function getUrgencyColor(urgency) {
    switch (urgency) {
        case 'CRÍTICA': return 'text-red-600';
        case 'ALTA': return 'text-orange-600';
        case 'MÉDIA': return 'text-yellow-600';
        case 'BAIXA': return 'text-green-600';
        default: return 'text-gray-600';
    }
}

/**
 * Componente de cooldown de decisão
 */
function createDecisionCooldown(remainingTime) {
    return `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="text-center">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="clock" class="w-8 h-8 text-gray-400"></i>
                </div>
                <h3 class="text-xl font-semibold mb-2">Aguarde para a próxima decisão</h3>
                <p class="text-gray-600 mb-4">
                    Você pode tomar uma nova decisão em:
                </p>
                <div class="text-2xl font-bold text-brasil-green mb-4">
                    ${remainingTime.hours}h ${remainingTime.minutes}min
                </div>
                <p class="text-sm text-gray-500">
                    Use esse tempo para analisar os rankings e ver como outros estados estão se saindo!
                </p>
                <div class="mt-4">
                    <button onclick="showPage('rankings')" class="btn-secondary">
                        <i data-lucide="trophy" class="w-4 h-4 mr-2"></i>
                        Ver Rankings
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Componente de ranking
 */
function createRankingComponent(ranking) {
    const statesHTML = ranking.states.map(state => `
        <div class="ranking-item">
            <div class="ranking-position">
                ${state.medal ? `
                    <span class="ranking-medal">${state.medal}</span>
                ` : `
                    <div class="ranking-number">${state.position}</div>
                `}
                <div>
                    <div class="font-medium text-gray-800">${state.name}</div>
                    <div class="text-sm text-gray-500">${state.region} • ${state.government_type}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold text-lg">${state.displayValue}</div>
                <div class="text-xs text-gray-500">${state.description}</div>
            </div>
        </div>
    `).join('');

    return `
        <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center space-x-3 mb-4">
                <i data-lucide="${getRankingIcon(ranking.id)}" class="w-6 h-6 text-brasil-green"></i>
                <div>
                    <h3 class="text-xl font-semibold">${ranking.title}</h3>
                    <p class="text-sm text-gray-600">${ranking.description}</p>
                </div>
            </div>
            
            <div class="space-y-3">
                ${statesHTML}
            </div>
            
            ${ranking.states.length === 0 ? `
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="users" class="w-12 h-12 mx-auto mb-4 text-gray-300"></i>
                    <p>Nenhum estado cadastrado ainda.</p>
                    <p class="text-sm">Seja o primeiro a criar um estado!</p>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Componente de lista de rankings
 */
function createRankingsGrid(rankings) {
    const rankingsHTML = rankings.map(ranking => {
        const topStates = ranking.states.slice(0, 3);
        
        return `
            <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" 
                 onclick="showRankingDetails('${ranking.id}')">
                <div class="flex items-center space-x-3 mb-4">
                    <i data-lucide="${getRankingIcon(ranking.id)}" class="w-6 h-6 text-brasil-green"></i>
                    <div>
                        <h3 class="font-semibold">${ranking.title}</h3>
                        <p class="text-sm text-gray-600">${ranking.description}</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    ${topStates.map(state => `
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center space-x-2">
                                ${state.medal ? `<span>${state.medal}</span>` : `<span class="text-gray-400">${state.position}.</span>`}
                                <span class="font-medium">${state.name}</span>
                            </div>
                            <span class="text-gray-600">${state.displayValue}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${ranking.states.length > 3 ? `
                    <div class="mt-3 pt-3 border-t border-gray-200 text-center">
                        <span class="text-xs text-gray-500">+${ranking.states.length - 3} mais estados</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    return `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${rankingsHTML}
        </div>
    `;
}

/**
 * Componente de estatísticas do jogo
 */
function createGameStatsComponent(stats) {
    return `
        <div class="grid md:grid-cols-4 gap-4">
            <div class="text-center">
                <div class="text-2xl font-bold text-brasil-green">${stats.total_states || 0}</div>
                <div class="text-sm text-gray-600">Estados Criados</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-brasil-blue">${stats.total_decisions || 0}</div>
                <div class="text-sm text-gray-600">Decisões Tomadas</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-brasil-yellow">${stats.average_score || 0}</div>
                <div class="text-sm text-gray-600">Pontuação Média</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-gray-700">${stats.last_updated ? formatRelativeTime(stats.last_updated) : '-'}</div>
                <div class="text-sm text-gray-600">Última Atualização</div>
            </div>
        </div>
    `;
}

/**
 * Componente de loading skeleton
 */
function createLoadingSkeleton(type = 'default') {
    switch (type) {
        case 'dashboard':
            return `
                <div class="space-y-6">
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="skeleton h-8 w-64 mb-4"></div>
                        <div class="skeleton h-4 w-full mb-2"></div>
                        <div class="skeleton h-4 w-3/4"></div>
                    </div>
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="skeleton h-6 w-48 mb-4"></div>
                        <div class="grid md:grid-cols-3 gap-4">
                            ${Array(6).fill().map(() => `
                                <div class="skeleton h-24 w-full"></div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        
        case 'rankings':
            return `
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${Array(6).fill().map(() => `
                        <div class="bg-white rounded-xl shadow-lg p-6">
                            <div class="skeleton h-6 w-48 mb-4"></div>
                            <div class="space-y-2">
                                ${Array(3).fill().map(() => `
                                    <div class="flex justify-between">
                                        <div class="skeleton h-4 w-32"></div>
                                        <div class="skeleton h-4 w-16"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        
        default:
            return `
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <div class="skeleton h-6 w-48 mb-4"></div>
                    <div class="skeleton h-4 w-full mb-2"></div>
                    <div class="skeleton h-4 w-3/4 mb-2"></div>
                    <div class="skeleton h-4 w-1/2"></div>
                </div>
            `;
    }
}

