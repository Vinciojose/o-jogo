"""
Rotas de Administração - BrasilSim
Sistema para facilitar testes e gerenciamento do jogo
"""
from flask import Blueprint, request, jsonify
from src.models.state import State
from src.models.decision import Decision
from src.models import db
import uuid
from datetime import datetime, timedelta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/states', methods=['GET'])
def admin_list_states():
    """Listar todos os estados com informações detalhadas para administração"""
    try:
        states = State.get_all_states()
        states_data = []
        
        for state in states:
            state_dict = state.to_dict()
            # Adicionar informações extras para admin
            state_dict['created_at_formatted'] = state.created_at.strftime('%d/%m/%Y %H:%M')
            state_dict['last_decision_formatted'] = state.last_decision.strftime('%d/%m/%Y %H:%M') if state.last_decision else 'Nunca'
            state_dict['can_make_decision'] = state.can_make_decision()
            state_dict['decisions_count'] = len(state.get_decision_history())
            states_data.append(state_dict)
        
        return jsonify({
            'states': states_data,
            'total': len(states_data),
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/states/<state_id>', methods=['DELETE'])
def admin_delete_state(state_id):
    """Deletar estado (para testes)"""
    try:
        # Validar UUID
        try:
            uuid.UUID(state_id)
        except ValueError:
            return jsonify({'error': 'ID inválido'}), 400
        
        state = State.get_by_id(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado'}), 404
        
        state_name = state.name
        db.session.delete(state)
        db.session.commit()
        
        return jsonify({
            'message': f'Estado "{state_name}" deletado com sucesso!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/states/<state_id>/indicators', methods=['PATCH'])
def admin_update_indicators(state_id):
    """Atualizar indicadores de um estado manualmente"""
    try:
        # Validar UUID
        try:
            uuid.UUID(state_id)
        except ValueError:
            return jsonify({'error': 'ID inválido'}), 400
        
        data = request.get_json()
        if not data or 'indicators' not in data:
            return jsonify({
                'error': 'Dados obrigatórios: indicators'
            }), 400
        
        state = State.get_by_id(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado'}), 404
        
        indicators = data['indicators']
        
        # Validar indicadores
        valid_indicators = ['economy', 'education', 'health', 'security', 'culture', 'satisfaction', 'corruption']
        for indicator, value in indicators.items():
            if indicator not in valid_indicators:
                return jsonify({
                    'error': f'Indicador inválido: {indicator}. Válidos: {", ".join(valid_indicators)}'
                }), 400
            
            if not isinstance(value, (int, float)) or value < 0 or value > 100:
                return jsonify({
                    'error': f'Valor do indicador {indicator} deve ser entre 0 e 100'
                }), 400
        
        # Atualizar indicadores
        for indicator, value in indicators.items():
            setattr(state, indicator, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Indicadores atualizados com sucesso!',
            'state': state.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/states/<state_id>/reset-cooldown', methods=['PATCH'])
def admin_reset_cooldown(state_id):
    """Resetar cooldown de decisão de um estado"""
    try:
        # Validar UUID
        try:
            uuid.UUID(state_id)
        except ValueError:
            return jsonify({'error': 'ID inválido'}), 400
        
        state = State.get_by_id(state_id)
        if not state:
            return jsonify({'error': 'Estado não encontrado'}), 404
        
        # Resetar cooldown (definir last_decision para mais de 24h atrás)
        state.last_decision = datetime.now() - timedelta(hours=25)
        db.session.commit()
        
        return jsonify({
            'message': f'Cooldown do estado "{state.name}" resetado com sucesso!',
            'can_make_decision': state.can_make_decision()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/decisions', methods=['GET'])
def admin_list_decisions():
    """Listar todas as decisões disponíveis"""
    try:
        decisions = Decision.query.all()
        decisions_data = []
        
        for decision in decisions:
            decision_dict = decision.to_dict()
            decisions_data.append(decision_dict)
        
        return jsonify({
            'decisions': decisions_data,
            'total': len(decisions_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/decisions', methods=['POST'])
def admin_create_decision():
    """Criar nova decisão política"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['title', 'description', 'options']):
            return jsonify({
                'error': 'Dados obrigatórios: title, description, options'
            }), 400
        
        title = data['title'].strip()
        description = data['description'].strip()
        options = data['options']
        
        if not isinstance(options, list) or len(options) < 2:
            return jsonify({
                'error': 'Deve haver pelo menos 2 opções'
            }), 400
        
        # Validar estrutura das opções
        for i, option in enumerate(options):
            if not isinstance(option, dict) or 'text' not in option or 'effects' not in option:
                return jsonify({
                    'error': f'Opção {i+1} deve ter "text" e "effects"'
                }), 400
        
        # Criar decisão
        decision = Decision.create_decision(title, description, options)
        
        return jsonify({
            'message': 'Decisão criada com sucesso!',
            'decision': decision.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/decisions/<decision_id>', methods=['DELETE'])
def admin_delete_decision(decision_id):
    """Deletar decisão"""
    try:
        # Validar UUID
        try:
            uuid.UUID(decision_id)
        except ValueError:
            return jsonify({'error': 'ID inválido'}), 400
        
        decision = Decision.query.get(decision_id)
        if not decision:
            return jsonify({'error': 'Decisão não encontrada'}), 404
        
        decision_title = decision.title
        db.session.delete(decision)
        db.session.commit()
        
        return jsonify({
            'message': f'Decisão "{decision_title}" deletada com sucesso!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/clear-all-data', methods=['DELETE'])
def admin_clear_all_data():
    """Limpar todos os dados (CUIDADO!)"""
    try:
        # Deletar todos os estados
        states_count = State.query.count()
        State.query.delete()
        
        # Deletar todas as decisões
        decisions_count = Decision.query.count()
        Decision.query.delete()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Todos os dados foram limpos! ({states_count} estados e {decisions_count} decisões removidos)',
            'warning': 'Esta ação não pode ser desfeita!'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

@admin_bp.route('/admin/stats', methods=['GET'])
def admin_get_stats():
    """Obter estatísticas gerais do sistema"""
    try:
        total_states = State.query.count()
        total_decisions = Decision.query.count()
        
        # Estados por região
        states_by_region = {}
        for region in ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul']:
            count = State.query.filter_by(region=region).count()
            states_by_region[region] = count
        
        # Estados por governo
        states_by_government = {}
        for gov in ['Democracia', 'Tecnocracia', 'Coronelismo']:
            count = State.query.filter_by(government=gov).count()
            states_by_government[gov] = count
        
        # Indicadores médios
        states = State.query.all()
        if states:
            avg_indicators = {
                'economia': sum(s.economia for s in states) / len(states),
                'educacao': sum(s.educacao for s in states) / len(states),
                'saude': sum(s.saude for s in states) / len(states),
                'seguranca': sum(s.seguranca for s in states) / len(states),
                'cultura': sum(s.cultura for s in states) / len(states),
                'satisfacao': sum(s.satisfacao for s in states) / len(states),
                'corrupcao': sum(s.corrupcao for s in states) / len(states)
            }
        else:
            avg_indicators = {}
        
        return jsonify({
            'total_states': total_states,
            'total_decisions': total_decisions,
            'states_by_region': states_by_region,
            'states_by_government': states_by_government,
            'average_indicators': avg_indicators,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Erro interno do servidor: {str(e)}'
        }), 500

