from flask import Blueprint, request, jsonify
from src.models import db, State, Decision
from datetime import datetime, timedelta

states_bp = Blueprint('states', __name__)

@states_bp.route('/states', methods=['POST'])
def create_state():
    """Cria um novo estado"""
    try:
        data = request.get_json()
        
        # Validação dos dados
        if not data or not all(k in data for k in ['name', 'region', 'government_type']):
            return jsonify({'error': 'Dados incompletos. Nome, região e tipo de governo são obrigatórios.'}), 400
        
        # Verifica se o nome já existe
        existing_state = State.query.filter_by(name=data['name']).first()
        if existing_state:
            return jsonify({'error': 'Já existe um estado com este nome.'}), 400
        
        # Valida região e tipo de governo
        if data['region'] not in State.get_regions():
            return jsonify({'error': 'Região inválida.'}), 400
        
        if data['government_type'] not in State.get_government_types():
            return jsonify({'error': 'Tipo de governo inválido.'}), 400
        
        # Cria o estado
        state = State(
            name=data['name'],
            region=data['region'],
            government_type=data['government_type']
        )
        
        db.session.add(state)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Estado {state.name} criado com sucesso!',
            'state': state.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@states_bp.route('/states/<int:state_id>', methods=['GET'])
def get_state(state_id):
    """Busca um estado pelo ID"""
    try:
        state = State.query.get(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado.'}), 404
        
        return jsonify({
            'success': True,
            'state': state.to_dict(),
            'status_message': state.get_status_message()
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@states_bp.route('/states', methods=['GET'])
def list_states():
    """Lista todos os estados"""
    try:
        states = State.query.all()
        return jsonify({
            'success': True,
            'states': [state.to_dict() for state in states],
            'total': len(states)
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@states_bp.route('/states/<int:state_id>/decision', methods=['POST'])
def apply_decision(state_id):
    """Aplica uma decisão ao estado"""
    try:
        data = request.get_json()
        
        if not data or 'option_index' not in data:
            return jsonify({'error': 'Índice da opção é obrigatório.'}), 400
        
        state = State.query.get(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado.'}), 404
        
        # Verifica cooldown (opcional - pode ser removido para testes)
        # if state.last_decision and datetime.utcnow() - state.last_decision < timedelta(hours=1):
        #     return jsonify({'error': 'Você deve aguardar antes de tomar outra decisão.'}), 429
        
        # Busca uma decisão (do banco ou padrão)
        decision = Decision.get_random_decision()
        
        option_index = data['option_index']
        if option_index < 0 or option_index >= len(decision.options):
            return jsonify({'error': 'Opção inválida.'}), 400
        
        # Aplica os efeitos da decisão
        chosen_option = decision.options[option_index]
        effects = chosen_option.get('effects', {})
        
        state.apply_decision_effects(effects)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Decisão aplicada com sucesso!',
            'decision': decision.to_dict(),
            'chosen_option': chosen_option,
            'state': state.to_dict(),
            'status_message': state.get_status_message()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@states_bp.route('/states/<int:state_id>/current-decision', methods=['GET'])
def get_current_decision(state_id):
    """Busca uma decisão atual para o estado"""
    try:
        state = State.query.get(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado.'}), 404
        
        # Busca uma decisão aleatória
        decision = Decision.get_random_decision()
        
        return jsonify({
            'success': True,
            'decision': decision.to_dict(),
            'state': state.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@states_bp.route('/regions', methods=['GET'])
def get_regions():
    """Retorna as regiões disponíveis"""
    return jsonify({
        'success': True,
        'regions': State.get_regions()
    })

@states_bp.route('/government-types', methods=['GET'])
def get_government_types():
    """Retorna os tipos de governo disponíveis"""
    return jsonify({
        'success': True,
        'government_types': State.get_government_types()
    })

@states_bp.route('/rankings', methods=['GET'])
def get_rankings():
    """Retorna os rankings dos estados"""
    try:
        states = State.query.all()
        
        if not states:
            return jsonify({
                'success': True,
                'rankings': {},
                'message': 'Nenhum estado encontrado.'
            })
        
        # Calcula diferentes rankings
        rankings = {
            'economia': sorted(states, key=lambda s: s.economy, reverse=True)[:10],
            'educacao': sorted(states, key=lambda s: s.education, reverse=True)[:10],
            'saude': sorted(states, key=lambda s: s.health, reverse=True)[:10],
            'seguranca': sorted(states, key=lambda s: s.security, reverse=True)[:10],
            'cultura': sorted(states, key=lambda s: s.culture, reverse=True)[:10],
            'satisfacao': sorted(states, key=lambda s: s.satisfaction, reverse=True)[:10],
            'menos_corrupto': sorted(states, key=lambda s: s.corruption)[:10],
            'geral': sorted(states, key=lambda s: (s.economy + s.education + s.health + s.security + s.culture + s.satisfaction - s.corruption) / 6, reverse=True)[:10]
        }
        
        # Converte para formato JSON
        rankings_json = {}
        for category, state_list in rankings.items():
            rankings_json[category] = []
            for i, state in enumerate(state_list):
                # Calcula o score baseado na categoria
                if category == 'economia':
                    score = state.economy
                elif category == 'educacao':
                    score = state.education
                elif category == 'saude':
                    score = state.health
                elif category == 'seguranca':
                    score = state.security
                elif category == 'cultura':
                    score = state.culture
                elif category == 'satisfacao':
                    score = state.satisfaction
                elif category == 'menos_corrupto':
                    score = state.corruption
                elif category == 'geral':
                    score = round((state.economy + state.education + state.health + state.security + state.culture + state.satisfaction - state.corruption) / 6, 1)
                else:
                    score = 0
                
                rankings_json[category].append({
                    'position': i + 1,
                    'state': state.to_dict(),
                    'score': score
                })
        
        return jsonify({
            'success': True,
            'rankings': rankings_json,
            'total_states': len(states)
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

