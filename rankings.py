"""
Rotas para Rankings - BrasilSim
"""
from flask import Blueprint, jsonify
from src.models.state import State
from sqlalchemy import desc, asc

rankings_bp = Blueprint('rankings', __name__)

@rankings_bp.route('/rankings', methods=['GET'])
def get_all_rankings():
    """Obter todos os rankings"""
    try:
        states = State.get_all_states()
        
        if not states:
            return jsonify({
                'rankings': {},
                'stats': {
                    'totalStates': 0,
                    'totalDecisions': 0,
                    'averageScore': 0
                }
            }), 200
        
        # Calcular estatísticas
        total_decisions = sum(len(state.get_decisions_history()) for state in states)
        average_score = sum(state.get_score() for state in states) / len(states)
        
        # Função para criar ranking
        def create_ranking(states_list, key_func, reverse=True):
            sorted_states = sorted(states_list, key=key_func, reverse=reverse)
            return [
                {
                    'position': i + 1,
                    'name': state.name,
                    'value': key_func(state),
                    'region': state.region,
                    'government': state.government
                }
                for i, state in enumerate(sorted_states[:10])  # Top 10
            ]
        
        # Rankings por indicador
        rankings = {
            'economia': create_ranking(states, lambda s: s.economia),
            'educacao': create_ranking(states, lambda s: s.educacao),
            'saude': create_ranking(states, lambda s: s.saude),
            'seguranca': create_ranking(states, lambda s: s.seguranca),
            'cultura': create_ranking(states, lambda s: s.cultura),
            'satisfacao': create_ranking(states, lambda s: s.satisfacao),
            'corrupcao': create_ranking(states, lambda s: s.corrupcao, reverse=False),  # Menor é melhor
            'geral': create_ranking(states, lambda s: s.get_score()),
            'equilibrio': create_ranking(states, lambda s: calculate_balance_score(s)),
            'crescimento': create_ranking(states, lambda s: calculate_growth_score(s))
        }
        
        # Ranking de estilos de governo
        government_styles = {}
        for state in states:
            style = state.get_government_style()
            if style not in government_styles:
                government_styles[style] = []
            government_styles[style].append({
                'name': state.name,
                'region': state.region,
                'score': state.get_score()
            })
        
        # Ordenar cada estilo por pontuação
        for style in government_styles:
            government_styles[style] = sorted(
                government_styles[style], 
                key=lambda x: x['score'], 
                reverse=True
            )[:5]  # Top 5 de cada estilo
        
        rankings['estilos'] = government_styles
        
        return jsonify({
            'rankings': rankings,
            'stats': {
                'totalStates': len(states),
                'totalDecisions': total_decisions,
                'averageScore': round(average_score, 1)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@rankings_bp.route('/rankings/<ranking_type>', methods=['GET'])
def get_specific_ranking(ranking_type):
    """Obter ranking específico"""
    try:
        states = State.get_all_states()
        
        if not states:
            return jsonify({
                'ranking': [],
                'type': ranking_type
            }), 200
        
        # Mapear tipos de ranking para funções
        ranking_functions = {
            'economia': lambda s: s.economia,
            'educacao': lambda s: s.educacao,
            'saude': lambda s: s.saude,
            'seguranca': lambda s: s.seguranca,
            'cultura': lambda s: s.cultura,
            'satisfacao': lambda s: s.satisfacao,
            'corrupcao': lambda s: s.corrupcao,
            'geral': lambda s: s.get_score(),
            'equilibrio': lambda s: calculate_balance_score(s),
            'crescimento': lambda s: calculate_growth_score(s)
        }
        
        if ranking_type not in ranking_functions:
            return jsonify({'error': 'Tipo de ranking inválido'}), 400
        
        key_func = ranking_functions[ranking_type]
        reverse = ranking_type != 'corrupcao'  # Corrupção: menor é melhor
        
        sorted_states = sorted(states, key=key_func, reverse=reverse)
        
        ranking = [
            {
                'position': i + 1,
                'name': state.name,
                'value': key_func(state),
                'region': state.region,
                'government': state.government,
                'style': state.get_government_style()
            }
            for i, state in enumerate(sorted_states)
        ]
        
        return jsonify({
            'ranking': ranking,
            'type': ranking_type,
            'total': len(ranking)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

def calculate_balance_score(state):
    """Calcula pontuação de equilíbrio (menor desvio padrão = mais equilibrado)"""
    indicators = [
        state.economia, state.educacao, state.saude,
        state.seguranca, state.cultura, state.satisfacao
    ]
    
    mean = sum(indicators) / len(indicators)
    variance = sum((x - mean) ** 2 for x in indicators) / len(indicators)
    std_dev = variance ** 0.5
    
    # Inverter para que menor desvio = maior pontuação
    return round(100 - std_dev, 1)

def calculate_growth_score(state):
    """Calcula pontuação de crescimento baseada no histórico"""
    decisions = state.get_decisions_history()
    
    if len(decisions) < 2:
        return 0
    
    # Simular crescimento baseado nas últimas decisões
    # Em uma implementação real, isso seria baseado em dados históricos
    recent_decisions = decisions[-3:] if len(decisions) >= 3 else decisions
    
    total_positive_effects = 0
    for decision in recent_decisions:
        effects = decision.get('decision', {}).get('effects', {})
        for indicator, change in effects.items():
            if indicator != 'corrupcao' and change > 0:
                total_positive_effects += change
            elif indicator == 'corrupcao' and change < 0:
                total_positive_effects += abs(change)
    
    return total_positive_effects

