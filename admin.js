/**
 * Módulo de Administração do BrasilSim
 * Sistema para facilitar testes e gerenciamento
 */
class BrasilSimAdmin {
    constructor() {
        this.api = new BrasilSimAPI();
        this.currentView = 'dashboard';
        this.init();
    }

    init() {
        console.log('🔧 Inicializando Sistema de Administração...');
        this.loadAdminDashboard();
    }

    /**
     * Carregar dashboard de administração
     */
    async loadAdminDashboard() {
        try {
            const stats = await this.api.request('/admin/stats');
            const states = await this.api.request('/admin/states');
            
            this.renderAdminInterface(stats, states);
        } catch (error) {
            console.error('Erro ao carregar dashboard admin:', error);
            this.showError('Erro ao carregar dados de administração');
        }
    }

    /**
     * Renderizar interface de administração
     */
    renderAdminInterface(stats, statesData) {
        const content = document.getElementById('content');
        
        content.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Header Admin -->
                <div class="bg-red-600 text-white p-4 shadow-lg">
                    <div class="container mx-auto flex justify-between items-center">
                        <div>
                            <h1 class="text-2xl font-bold">🔧 Administração BrasilSim</h1>
                            <p class="text-red-100">Sistema de gerenciamento e testes</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="admin.switchView('dashboard')" 
                                    class="admin-nav-btn ${this.currentView === 'dashboard' ? 'active' : ''}">
                                📊 Dashboard
                            </button>
                            <button onclick="admin.switchView('states')" 
                                    class="admin-nav-btn ${this.currentView === 'states' ? 'active' : ''}">
                                🏛️ Estados
                            </button>
                            <button onclick="admin.switchView('decisions')" 
                                    class="admin-nav-btn ${this.currentView === 'decisions' ? 'active' : ''}">
                                ⚖️ Decisões
                            </button>
                            <button onclick="admin.switchView('tools')" 
                                    class="admin-nav-btn ${this.currentView === 'tools' ? 'active' : ''}">
                                🛠️ Ferramentas
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Conteúdo Principal -->
                <div class="container mx-auto p-6">
                    <div id="admin-content">
                        ${this.renderDashboardView(stats, statesData)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar view do dashboard
     */
    renderDashboardView(stats, statesData) {
        return `
            <!-- Estatísticas Gerais -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-100 rounded-full">
                            <span class="text-2xl">🏛️</span>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-700">Estados</h3>
                            <p class="text-3xl font-bold text-blue-600">${stats.total_states}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="p-3 bg-green-100 rounded-full">
                            <span class="text-2xl">⚖️</span>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-700">Decisões</h3>
                            <p class="text-3xl font-bold text-green-600">${stats.total_decisions}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="p-3 bg-yellow-100 rounded-full">
                            <span class="text-2xl">📊</span>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-700">Média Economia</h3>
                            <p class="text-3xl font-bold text-yellow-600">
                                ${stats.average_indicators.economy ? Math.round(stats.average_indicators.economy) : 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center">
                        <div class="p-3 bg-purple-100 rounded-full">
                            <span class="text-2xl">😊</span>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold text-gray-700">Satisfação</h3>
                            <p class="text-3xl font-bold text-purple-600">
                                ${stats.average_indicators.satisfaction ? Math.round(stats.average_indicators.satisfaction) : 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Distribuição por Região -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Estados por Região</h3>
                    <div class="space-y-3">
                        ${Object.entries(stats.states_by_region).map(([region, count]) => `
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700">${region}</span>
                                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    ${count}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-bold mb-4">Estados por Governo</h3>
                    <div class="space-y-3">
                        ${Object.entries(stats.states_by_government).map(([gov, count]) => `
                            <div class="flex justify-between items-center">
                                <span class="text-gray-700">${gov}</span>
                                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    ${count}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Ações Rápidas -->
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-bold mb-4">Ações Rápidas</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="admin.createTestState()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors">
                        🏛️ Criar Estado de Teste
                    </button>
                    <button onclick="admin.resetAllCooldowns()" 
                            class="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors">
                        ⏰ Resetar Cooldowns
                    </button>
                    <button onclick="admin.switchView('tools')" 
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors">
                        🛠️ Ferramentas Avançadas
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar view de estados
     */
    async renderStatesView() {
        try {
            const statesData = await this.api.request('/admin/states');
            
            return `
                <div class="bg-white rounded-lg shadow-md">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex justify-between items-center">
                            <h2 class="text-2xl font-bold">Gerenciar Estados</h2>
                            <button onclick="admin.createTestState()" 
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                                + Criar Estado de Teste
                            </button>
                        </div>
                    </div>
                    
                    <div class="p-6">
                        ${statesData.states.length === 0 ? `
                            <div class="text-center py-12">
                                <span class="text-6xl">🏛️</span>
                                <h3 class="text-xl font-semibold text-gray-600 mt-4">Nenhum estado encontrado</h3>
                                <p class="text-gray-500 mt-2">Crie um estado de teste para começar</p>
                            </div>
                        ` : `
                            <div class="overflow-x-auto">
                                <table class="w-full table-auto">
                                    <thead>
                                        <tr class="bg-gray-50">
                                            <th class="px-4 py-3 text-left font-semibold">Nome</th>
                                            <th class="px-4 py-3 text-left font-semibold">Região</th>
                                            <th class="px-4 py-3 text-left font-semibold">Governo</th>
                                            <th class="px-4 py-3 text-left font-semibold">Economia</th>
                                            <th class="px-4 py-3 text-left font-semibold">Satisfação</th>
                                            <th class="px-4 py-3 text-left font-semibold">Decisões</th>
                                            <th class="px-4 py-3 text-left font-semibold">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${statesData.states.map(state => `
                                            <tr class="border-b border-gray-200 hover:bg-gray-50">
                                                <td class="px-4 py-3 font-medium">${state.name}</td>
                                                <td class="px-4 py-3">${state.region}</td>
                                                <td class="px-4 py-3">${state.government_type}</td>
                                                <td class="px-4 py-3">
                                                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                        ${state.economy}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-3">
                                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                                        ${state.satisfaction}
                                                    </span>
                                                </td>
                                                <td class="px-4 py-3">${state.decisions_count}</td>
                                                <td class="px-4 py-3">
                                                    <div class="flex space-x-2">
                                                        <button onclick="admin.editState('${state.id}')" 
                                                                class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm">
                                                            ✏️ Editar
                                                        </button>
                                                        <button onclick="admin.resetCooldown('${state.id}')" 
                                                                class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm">
                                                            ⏰ Reset
                                                        </button>
                                                        <button onclick="admin.deleteState('${state.id}', '${state.name}')" 
                                                                class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">
                                                            🗑️ Deletar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Erro ao carregar estados:', error);
            return '<div class="text-red-500">Erro ao carregar estados</div>';
        }
    }

    /**
     * Alternar entre views
     */
    async switchView(view) {
        this.currentView = view;
        const adminContent = document.getElementById('admin-content');
        
        // Atualizar botões de navegação
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[onclick="admin.switchView('${view}')"]`).classList.add('active');
        
        // Renderizar conteúdo da view
        switch (view) {
            case 'dashboard':
                try {
                    const stats = await this.api.request('/admin/stats');
                    const states = await this.api.request('/admin/states');
                    adminContent.innerHTML = this.renderDashboardView(stats, states);
                } catch (error) {
                    adminContent.innerHTML = '<div class="text-red-500">Erro ao carregar dashboard</div>';
                }
                break;
            case 'states':
                adminContent.innerHTML = await this.renderStatesView();
                break;
            case 'decisions':
                adminContent.innerHTML = await this.renderDecisionsView();
                break;
            case 'tools':
                adminContent.innerHTML = this.renderToolsView();
                break;
        }
    }

    /**
     * Criar estado de teste
     */
    async createTestState() {
        const testNames = [
            'Estado de Teste Alpha',
            'Estado de Teste Beta',
            'Estado de Teste Gamma',
            'Estado de Teste Delta',
            'Estado de Teste Epsilon'
        ];
        
        const regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
        const governments = ['Democracia', 'Tecnocracia', 'Coronelismo'];
        
        const stateData = {
            name: testNames[Math.floor(Math.random() * testNames.length)] + ' ' + Date.now(),
            region: regions[Math.floor(Math.random() * regions.length)],
            government: governments[Math.floor(Math.random() * governments.length)]
        };
        
        try {
            await this.api.createState(stateData);
            this.showSuccess('Estado de teste criado com sucesso!');
            this.loadAdminDashboard();
        } catch (error) {
            this.showError('Erro ao criar estado de teste');
        }
    }

    /**
     * Deletar estado
     */
    async deleteState(stateId, stateName) {
        if (confirm(`Tem certeza que deseja deletar o estado "${stateName}"?`)) {
            try {
                await this.api.request(`/admin/states/${stateId}`, { method: 'DELETE' });
                this.showSuccess('Estado deletado com sucesso!');
                this.switchView('states');
            } catch (error) {
                this.showError('Erro ao deletar estado');
            }
        }
    }

    /**
     * Resetar cooldown de um estado
     */
    async resetCooldown(stateId) {
        try {
            await this.api.request(`/admin/states/${stateId}/reset-cooldown`, { method: 'PATCH' });
            this.showSuccess('Cooldown resetado com sucesso!');
            this.switchView('states');
        } catch (error) {
            this.showError('Erro ao resetar cooldown');
        }
    }

    /**
     * Mostrar mensagem de sucesso
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Mostrar mensagem de erro
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Renderizar view de ferramentas
     */
    renderToolsView() {
        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold mb-6">🛠️ Ferramentas de Administração</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-3">⚠️ Ações Perigosas</h3>
                        <div class="space-y-3">
                            <button onclick="admin.clearAllData()" 
                                    class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                                🗑️ Limpar Todos os Dados
                            </button>
                            <p class="text-sm text-gray-600">
                                Remove todos os estados e decisões do sistema. Esta ação não pode ser desfeita!
                            </p>
                        </div>
                    </div>
                    
                    <div class="border border-gray-200 rounded-lg p-4">
                        <h3 class="text-lg font-semibold mb-3">🔄 Utilitários</h3>
                        <div class="space-y-3">
                            <button onclick="admin.resetAllCooldowns()" 
                                    class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                                ⏰ Resetar Todos os Cooldowns
                            </button>
                            <button onclick="admin.generateTestData()" 
                                    class="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
                                📊 Gerar Dados de Teste
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Limpar todos os dados
     */
    async clearAllData() {
        if (confirm('⚠️ ATENÇÃO: Esta ação irá deletar TODOS os dados do sistema!\n\nTem certeza absoluta que deseja continuar?')) {
            if (confirm('Esta é sua última chance! Confirma a exclusão de TODOS os dados?')) {
                try {
                    await this.api.request('/admin/clear-all-data', { method: 'DELETE' });
                    this.showSuccess('Todos os dados foram limpos!');
                    this.loadAdminDashboard();
                } catch (error) {
                    this.showError('Erro ao limpar dados');
                }
            }
        }
    }

    /**
     * Renderizar view de decisões (placeholder)
     */
    async renderDecisionsView() {
        return `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-2xl font-bold mb-6">⚖️ Gerenciar Decisões</h2>
                <p class="text-gray-600">Funcionalidade em desenvolvimento...</p>
            </div>
        `;
    }
}

// CSS para administração
const adminCSS = `
    .admin-nav-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
    }
    
    .admin-nav-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    .admin-nav-btn.active {
        background: white;
        color: #dc2626;
    }
`;

// Adicionar CSS ao documento
const style = document.createElement('style');
style.textContent = adminCSS;
document.head.appendChild(style);

// Instância global do admin
let admin;

