"""
Rotas para Estados - BrasilSim
"""
from flask import Blueprint, request, jsonify
from src.models.state import State
from src.models.decision import Decision
from src.models import db
import uuid

states_bp = Blueprint('states', __name__)

@states_bp.route('/states', methods=['POST'])
def create_state():
    """Criar novo estado"""
    try:
        data = request.get_json()
        
        # Validar dados obrigatórios
        if not data or not all(k in data for k in ["name", "region", "government"]):
            return jsonify({
                "error": "Dados obrigatórios: name, region, government"
            }), 400
        
        name = data["name"].strip()
        region = data["region"]
        government = data["government"]
        
        # Validar região
        valid_regions = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']
        if region not in valid_regions:
            return jsonify({
                'error': f'Região deve ser uma de: {", ".join(valid_regions)}'
            }), 400
        
        # Validar governo
        valid_governments = ['Democracia', 'Tecnocracia', 'Coronelismo']
        if government not in valid_governments:
            return jsonify({
                'error': f'Governo deve ser um de: {", ".join(valid_governments)}'
            }), 400
        
        # Verificar se nome já existe
        existing_state = State.query.filter_by(name=name).first()
        if existing_state:
            return jsonify({
                'error': 'Já existe um estado com este nome'
            }), 409
        
        # Criar estado
        state = State.create_state(name, region, government)
        
        return jsonify({
            'success': True,
            'message': f'Estado {name} criado com sucesso!',
            'state': state.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@states_bp.route('/states/<state_id>', methods=['GET'])
def get_state(state_id):
    """Buscar estado por ID"""
    try:
        # Validar UUID
        try:
            uuid.UUID(state_id)
        except ValueError:
            return jsonify({'error': 'ID inválido'}), 400
        
        state = State.get_by_id(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado'}), 404
        
        return jsonify({
            'state': state.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@states_bp.route('/states', methods=['GET'])
def list_states():
    """Listar todos os estados"""
    try:
        states = State.get_all_states()
        return jsonify({
            'states': [state.to_dict() for state in states],
            'total': len(states)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@states_bp.route('/states/<state_id>/decision', methods=['PATCH'])
def apply_decision(state_id):
    """Aplicar decisão política ao estado"""
    try:
        # Validar UUID
        try:
            uuid.UUID(state_id)
        except ValueError:
            return jsonify({'error': 'ID inválido'}), 400
        
        data = request.get_json()
        if not data or 'decisionId' not in data or 'optionIndex' not in data:
            return jsonify({
                'error': 'Dados obrigatórios: decisionId, optionIndex'
            }), 400
        
        state = State.get_by_id(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado'}), 404
        
        # Verificar cooldown
        if not state.can_make_decision():
            return jsonify({
                'error': 'Você deve aguardar 24 horas entre decisões'
            }), 429
        
        # Buscar decisão
        decision = Decision.query.get(data['decisionId'])
        if not decision:
            return jsonify({'error': 'Decisão não encontrada'}), 404
        
        # Validar opção
        options = decision.get_options()
        option_index = data['optionIndex']
        
        if option_index < 0 or option_index >= len(options):
            return jsonify({'error': 'Índice de opção inválido'}), 400
        
        selected_option = options[option_index]
        
        # Aplicar efeitos
        effects = selected_option.get('effects', {})
        state.update_indicators(effects)
        
        # Registrar decisão no histórico
        decision_record = {
            'decisionId': str(decision.id),
            'title': decision.title,
            'selectedOption': selected_option['text'],
            'effects': effects
        }
        state.add_decision(decision_record)
        
        # Salvar no banco
        db.session.commit()
        
        return jsonify({
            'message': 'Decisão aplicada com sucesso!',
            'state': state.to_dict(),
            'appliedEffects': effects
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@states_bp.route('/states/<state_id>/random-decision', methods=['GET'])
def get_random_decision(state_id):
    """Obter decisão aleatória para o estado"""
    try:
        # Validar UUID
        try:
            uuid.UUID(state_id)
        except ValueError:
            return jsonify({'error': 'ID inválido'}), 400
        
        state = State.get_by_id(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado'}), 404
        
        # Verificar cooldown
        if not state.can_make_decision():
            return jsonify({
                'error': 'Você deve aguardar 24 horas entre decisões',
                'canMakeDecision': False
            }), 429
        
        # Buscar decisão aleatória
        decision = Decision.get_random_decision(state)
        if not decision:
            return jsonify({'error': 'Nenhuma decisão disponível'}), 404
        
        return jsonify({
            'decision': decision.to_dict(),
            'canMakeDecision': True
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

