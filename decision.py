"""
Modelo de Decisão para BrasilSim
"""
import uuid
import json
import random
from src.models import db
from sqlalchemy.dialects.postgresql import UUID

class Decision(db.Model):
    """Modelo de Decisão Política"""
    __tablename__ = 'decisions'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    context = db.Column(db.String(100))  # 'economia', 'educacao', etc.
    government = db.Column(db.String(50))  # 'Democracia', 'Tecnocracia', etc.
    options_json = db.Column(db.Text, nullable=False)  # JSON das opções
    
    def __init__(self, title, description, options, context=None, government=None):
        self.title = title
        self.description = description
        self.options_json = json.dumps(options)
        self.context = context
        self.government = government
    
    def get_options(self):
        """Retorna opções da decisão"""
        try:
            return json.loads(self.options_json)
        except:
            return []
    
    def to_dict(self):
        """Converte decisão para dicionário"""
        return {
            'id': str(self.id),
            'title': self.title,
            'description': self.description,
            'context': self.context,
            'government': self.government,
            'options': self.get_options()
        }
    
    @staticmethod
    def get_random_decision(state=None):
        """Obtém decisão aleatória, filtrada por contexto se fornecido"""
        query = Decision.query
        
        # Filtrar por tipo de governo se fornecido
        if state and state.government:
            # Primeiro tenta decisões específicas do governo
            specific_decisions = query.filter_by(government=state.government).all()
            if specific_decisions:
                return random.choice(specific_decisions)
        
        # Se não encontrou específicas, pega qualquer uma
        all_decisions = query.all()
        if all_decisions:
            return random.choice(all_decisions)
        
        return None
    
    @staticmethod
    def create_sample_decisions():
        """Cria decisões de exemplo para o jogo"""
        sample_decisions = [
            {
                'title': 'Programa de Renda Básica Universal',
                'description': 'Seu governo está debatendo a implementação de um programa de renda básica para todos os cidadãos.',
                'context': 'economia',
                'government': 'Democracia',
                'options': [
                    {
                        'text': 'Implementar programa amplo',
                        'effects': {'satisfacao': 8, 'economia': -5, 'corrupcao': 2}
                    },
                    {
                        'text': 'Programa piloto limitado',
                        'effects': {'satisfacao': 3, 'economia': -2, 'educacao': 1}
                    },
                    {
                        'text': 'Rejeitar proposta',
                        'effects': {'economia': 3, 'satisfacao': -6, 'seguranca': -2}
                    }
                ]
            },
            {
                'title': 'Investimento em Inteligência Artificial',
                'description': 'Especialistas recomendam investimento massivo em IA para modernizar o estado.',
                'context': 'economia',
                'government': 'Tecnocracia',
                'options': [
                    {
                        'text': 'Investimento total',
                        'effects': {'economia': 10, 'educacao': 5, 'satisfacao': -3, 'cultura': -2}
                    },
                    {
                        'text': 'Investimento gradual',
                        'effects': {'economia': 5, 'educacao': 3, 'satisfacao': 1}
                    },
                    {
                        'text': 'Focar em capacitação humana',
                        'effects': {'educacao': 8, 'satisfacao': 4, 'economia': 2}
                    }
                ]
            },
            {
                'title': 'Conflito com Governo Federal',
                'description': 'O governo federal quer implementar uma política que vai contra os interesses locais.',
                'context': 'politica',
                'government': 'Coronelismo',
                'options': [
                    {
                        'text': 'Resistir abertamente',
                        'effects': {'satisfacao': 8, 'economia': -5, 'seguranca': -3}
                    },
                    {
                        'text': 'Negociar em privado',
                        'effects': {'economia': 3, 'corrupcao': 4, 'satisfacao': 1}
                    },
                    {
                        'text': 'Aceitar imposição',
                        'effects': {'economia': 2, 'satisfacao': -8, 'corrupcao': -2}
                    }
                ]
            },
            {
                'title': 'Crise Econômica Nacional',
                'description': 'O Brasil enfrenta uma recessão e seu estado precisa decidir como reagir.',
                'context': 'economia',
                'options': [
                    {
                        'text': 'Pacote de estímulo fiscal',
                        'effects': {'economia': 8, 'satisfacao': 4, 'corrupcao': 3}
                    },
                    {
                        'text': 'Austeridade rigorosa',
                        'effects': {'economia': 3, 'satisfacao': -6, 'saude': -2, 'educacao': -2}
                    },
                    {
                        'text': 'Investir em infraestrutura',
                        'effects': {'economia': 6, 'satisfacao': 2, 'corrupcao': 1}
                    }
                ]
            },
            {
                'title': 'Reforma do Ensino Médio',
                'description': 'Estudantes e professores protestam contra mudanças no currículo escolar.',
                'context': 'educacao',
                'options': [
                    {
                        'text': 'Manter reforma',
                        'effects': {'educacao': 5, 'satisfacao': -8, 'seguranca': -3}
                    },
                    {
                        'text': 'Reverter mudanças',
                        'effects': {'educacao': -2, 'satisfacao': 6, 'cultura': 3}
                    },
                    {
                        'text': 'Negociar com manifestantes',
                        'effects': {'educacao': 2, 'satisfacao': 3, 'corrupcao': 1}
                    }
                ]
            },
            {
                'title': 'Pandemia de Dengue',
                'description': 'Surto de dengue ameaça a saúde pública do estado.',
                'context': 'saude',
                'options': [
                    {
                        'text': 'Campanha massiva de prevenção',
                        'effects': {'saude': 10, 'economia': -4, 'satisfacao': 3}
                    },
                    {
                        'text': 'Foco no tratamento',
                        'effects': {'saude': 6, 'economia': -2, 'satisfacao': 1}
                    },
                    {
                        'text': 'Medidas básicas apenas',
                        'effects': {'saude': -3, 'economia': 2, 'satisfacao': -5}
                    }
                ]
            },
            {
                'title': 'Violência Urbana',
                'description': 'Índices de criminalidade aumentaram significativamente nas grandes cidades.',
                'context': 'seguranca',
                'options': [
                    {
                        'text': 'Aumentar policiamento',
                        'effects': {'seguranca': 8, 'economia': -4, 'satisfacao': 2}
                    },
                    {
                        'text': 'Programas sociais preventivos',
                        'effects': {'seguranca': 4, 'educacao': 3, 'cultura': 2, 'economia': -2}
                    },
                    {
                        'text': 'Endurecer leis',
                        'effects': {'seguranca': 6, 'satisfacao': -3, 'corrupcao': 2}
                    }
                ]
            },
            {
                'title': 'Lei de Incentivo Cultural',
                'description': 'Artistas pedem mais recursos para projetos culturais.',
                'context': 'cultura',
                'options': [
                    {
                        'text': 'Aumentar significativamente',
                        'effects': {'cultura': 10, 'satisfacao': 4, 'economia': -3}
                    },
                    {
                        'text': 'Aumento moderado',
                        'effects': {'cultura': 5, 'satisfacao': 2, 'economia': -1}
                    },
                    {
                        'text': 'Manter atual',
                        'effects': {'cultura': -2, 'satisfacao': -3, 'economia': 2}
                    }
                ]
            }
        ]
        
        for decision_data in sample_decisions:
            decision = Decision(
                title=decision_data['title'],
                description=decision_data['description'],
                options=decision_data['options'],
                context=decision_data.get('context'),
                government=decision_data.get('government')
            )
            db.session.add(decision)
        
        db.session.commit()
        return len(sample_decisions)

