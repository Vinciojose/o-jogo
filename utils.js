/**
 * Utilitários gerais para o BrasilSim
 */

/**
 * Mostrar/ocultar loading overlay
 */
function showLoading(show = true) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !show);
    }
}

/**
 * Mostrar notificação toast
 */
function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
                ${icon}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;

    container.appendChild(toast);
    
    // Inicializar ícones Lucide no toast
    lucide.createIcons();

    // Remover automaticamente após o tempo especificado
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: '<i data-lucide="check-circle" class="w-5 h-5 text-green-500"></i>',
        error: '<i data-lucide="alert-circle" class="w-5 h-5 text-red-500"></i>',
        warning: '<i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-500"></i>',
        info: '<i data-lucide="info" class="w-5 h-5 text-blue-500"></i>'
    };
    return icons[type] || icons.info;
}

/**
 * Formatação de números
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Formatação de datas
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return formatDate(dateString);
}

/**
 * Validação de formulários
 */
function validateForm(formElement) {
    const errors = [];
    const inputs = formElement.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            errors.push(`${input.previousElementSibling.textContent} é obrigatório`);
            input.classList.add('border-red-500');
        } else {
            input.classList.remove('border-red-500');
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Debounce para otimizar performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle para limitar execuções
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Animações suaves
 */
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.min(progress / duration, 1);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const opacity = Math.max(initialOpacity - (progress / duration), 0);
        
        element.style.opacity = opacity;
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

/**
 * Utilitários para indicadores
 */
function getIndicatorColor(value) {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-blue-600';
    if (value >= 40) return 'text-yellow-600';
    if (value >= 20) return 'text-orange-600';
    return 'text-red-600';
}

function getIndicatorStatus(value) {
    if (value >= 80) return 'Excelente';
    if (value >= 60) return 'Bom';
    if (value >= 40) return 'Regular';
    if (value >= 20) return 'Ruim';
    return 'Crítico';
}

function getIndicatorIcon(indicator) {
    const icons = {
        economia: 'dollar-sign',
        educacao: 'book-open',
        saude: 'heart',
        seguranca: 'shield',
        cultura: 'palette',
        satisfacao_popular: 'smile',
        corrupcao: 'alert-triangle'
    };
    return icons[indicator] || 'bar-chart';
}

function getIndicatorName(indicator) {
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
 * Utilitários para rankings
 */
function getRankingIcon(rankingId) {
    const icons = {
        economia: 'dollar-sign',
        educacao: 'book-open',
        saude: 'heart',
        seguranca: 'shield',
        cultura: 'palette',
        satisfacao_popular: 'smile',
        overall: 'trophy',
        autoritarismo: 'crown',
        corrupcao_baixa: 'star',
        equilibrio: 'scale',
        crescimento: 'trending-up'
    };
    return icons[rankingId] || 'bar-chart';
}

/**
 * Utilitários para governo e região
 */
function getGovernmentDescription(type) {
    const descriptions = {
        'Democracia': 'Governo eleito pelo povo, foca na satisfação popular',
        'Tecnocracia': 'Governo de especialistas, foca em eficiência e dados',
        'Coronelismo': 'Poder local concentrado, tradições regionais fortes'
    };
    return descriptions[type] || type;
}

function getRegionDescription(region) {
    const descriptions = {
        'Norte': 'Região amazônica com desafios únicos de desenvolvimento',
        'Nordeste': 'Rica cultura e desafios socioeconômicos',
        'Centro-Oeste': 'Agronegócio e expansão da fronteira agrícola',
        'Sudeste': 'Região mais industrializada e populosa',
        'Sul': 'Tradições europeias e economia diversificada'
    };
    return descriptions[region] || region;
}

/**
 * Utilitários para tempo
 */
function canMakeDecision(lastDecisionTime) {
    if (!lastDecisionTime) return true;
    
    const lastDecision = new Date(lastDecisionTime);
    const now = new Date();
    const hoursSince = (now - lastDecision) / (1000 * 60 * 60);
    
    return hoursSince >= 24;
}

function getTimeUntilNextDecision(lastDecisionTime) {
    if (!lastDecisionTime) return null;
    
    const lastDecision = new Date(lastDecisionTime);
    const nextDecision = new Date(lastDecision.getTime() + (24 * 60 * 60 * 1000));
    const now = new Date();
    
    if (now >= nextDecision) return null;
    
    const diffMs = nextDecision - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes };
}

/**
 * Utilitários para URL e navegação
 */
function updateURL(page, params = {}) {
    const url = new URL(window.location);
    url.searchParams.set('page', page);
    
    Object.keys(params).forEach(key => {
        if (params[key]) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    
    window.history.pushState({}, '', url);
}

function getURLParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (const [key, value] of params) {
        result[key] = value;
    }
    
    return result;
}

/**
 * Utilitários para responsividade
 */
function isMobile() {
    return window.innerWidth < 768;
}

function isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
}

function isDesktop() {
    return window.innerWidth >= 1024;
}

/**
 * Utilitários para acessibilidade
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Utilitários para performance
 */
function preloadImage(src) {
    const img = new Image();
    img.src = src;
}

function lazyLoad(selector) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const src = element.dataset.src;
                
                if (src) {
                    element.src = src;
                    element.removeAttribute('data-src');
                }
                
                observer.unobserve(element);
            }
        });
    });
    
    elements.forEach(element => observer.observe(element));
}

