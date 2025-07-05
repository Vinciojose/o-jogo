import json
import random
from . import db

class Decision(db.Model):
    """
    Modelo de Decisão - representa uma decisão política que pode ser tomada
    """
    __tablename__ = 'decisions'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    options_json = db.Column(db.Text, nullable=False)  # JSON com as opções
    category = db.Column(db.String(50), default='geral')
    
    def __init__(self, title, description, options, category='geral'):
        self.title = title
        self.description = description
        self.options_json = json.dumps(options)
        self.category = category
    
    @property
    def options(self):
        """Retorna as opções da decisão como lista"""
        return json.loads(self.options_json)
    
    def to_dict(self):
        """Converte a decisão para dicionário"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'options': self.options,
            'category': self.category
        }
    
    @staticmethod
    def get_random_decision():
        """Retorna uma decisão aleatória do banco ou das decisões padrão"""
        # Primeiro tenta pegar do banco
        decisions = Decision.query.all()
        if decisions:
            return random.choice(decisions)
        
        # Se não houver no banco, retorna uma decisão padrão
        return Decision.get_default_decision()
    
    @staticmethod
    def get_default_decision():
        """Retorna uma decisão padrão para quando não há decisões no banco"""
        default_decisions = [
            {
                'title': 'Proposta de Redução da Idade Mínima para Trabalho',
                'description': 'O Congresso propõe reduzir a idade mínima para trabalho formal de 16 para 14 anos para combater o desemprego juvenil.',
                'options': [
                    {
                        'text': 'Aprovar a proposta',
                        'effects': {'economy': 5, 'education': -3, 'satisfaction': -2}
                    },
                    {
                        'text': 'Rejeitar a proposta',
                        'effects': {'education': 4, 'economy': -2, 'satisfaction': 1}
                    }
                ]
            },
            {
                'title': 'Investimento em Tecnologia Educacional',
                'description': 'Proposta para investir pesadamente em tablets e internet para todas as escolas públicas.',
                'options': [
                    {
                        'text': 'Investir massivamente',
                        'effects': {'education': 6, 'economy': -4, 'satisfaction': 2}
                    },
                    {
                        'text': 'Investimento moderado',
                        'effects': {'education': 3, 'economy': -1, 'satisfaction': 1}
                    },
                    {
                        'text': 'Não investir agora',
                        'effects': {'economy': 2, 'education': -2, 'satisfaction': -1}
                    }
                ]
            },
            {
                'title': 'Programa de Segurança Pública',
                'description': 'Proposta para aumentar o efetivo policial e instalar câmeras de segurança em toda a cidade.',
                'options': [
                    {
                        'text': 'Aprovar programa completo',
                        'effects': {'security': 7, 'economy': -3, 'satisfaction': 3}
                    },
                    {
                        'text': 'Programa reduzido',
                        'effects': {'security': 4, 'economy': -1, 'satisfaction': 1}
                    },
                    {
                        'text': 'Focar em policiamento comunitário',
                        'effects': {'security': 3, 'satisfaction': 4, 'culture': 2}
                    }
                ]
            },
            {
                'title': 'Festival Cultural Nacional',
                'description': 'Proposta para organizar um grande festival cultural com artistas locais e nacionais.',
                'options': [
                    {
                        'text': 'Festival grande e caro',
                        'effects': {'culture': 8, 'economy': -5, 'satisfaction': 4}
                    },
                    {
                        'text': 'Festival modesto',
                        'effects': {'culture': 4, 'economy': -2, 'satisfaction': 2}
                    },
                    {
                        'text': 'Cancelar o festival',
                        'effects': {'economy': 1, 'culture': -3, 'satisfaction': -2}
                    }
                ]
            },
            {
                'title': 'Reforma do Sistema de Saúde',
                'description': 'Proposta para reformar completamente o sistema de saúde pública com novos hospitais e equipamentos.',
                'options': [
                    {
                        'text': 'Reforma completa',
                        'effects': {'health': 8, 'economy': -6, 'satisfaction': 5}
                    },
                    {
                        'text': 'Melhorias graduais',
                        'effects': {'health': 4, 'economy': -2, 'satisfaction': 2}
                    },
                    {
                        'text': 'Manter sistema atual',
                        'effects': {'economy': 1, 'health': -1, 'satisfaction': -1}
                    }
                ]
            }
        ]
        
        chosen = random.choice(default_decisions)
        return type('obj', (object,), {
            'id': 0,
            'title': chosen['title'],
            'description': chosen['description'],
            'options': chosen['options'],
            'category': 'default',
            'to_dict': lambda: chosen
        })
    
    @staticmethod
    def create_default_decisions():
        """Cria as decisões padrão no banco de dados"""
        default_decisions = [
            {
                'title': 'Proposta de Redução da Idade Mínima para Trabalho',
                'description': 'O Congresso propõe reduzir a idade mínima para trabalho formal de 16 para 14 anos para combater o desemprego juvenil.',
                'options': [
                    {
                        'text': 'Aprovar a proposta',
                        'effects': {'economy': 5, 'education': -3, 'satisfaction': -2}
                    },
                    {
                        'text': 'Rejeitar a proposta',
                        'effects': {'education': 4, 'economy': -2, 'satisfaction': 1}
                    }
                ],
                'category': 'economia'
            },
            {
                'title': 'Investimento em Tecnologia Educacional',
                'description': 'Proposta para investir pesadamente em tablets e internet para todas as escolas públicas.',
                'options': [
                    {
                        'text': 'Investir massivamente',
                        'effects': {'education': 6, 'economy': -4, 'satisfaction': 2}
                    },
                    {
                        'text': 'Investimento moderado',
                        'effects': {'education': 3, 'economy': -1, 'satisfaction': 1}
                    },
                    {
                        'text': 'Não investir agora',
                        'effects': {'economy': 2, 'education': -2, 'satisfaction': -1}
                    }
                ],
                'category': 'educacao'
            },
            {
                'title': 'Programa de Segurança Pública',
                'description': 'Proposta para aumentar o efetivo policial e instalar câmeras de segurança em toda a cidade.',
                'options': [
                    {
                        'text': 'Aprovar programa completo',
                        'effects': {'security': 7, 'economy': -3, 'satisfaction': 3}
                    },
                    {
                        'text': 'Programa reduzido',
                        'effects': {'security': 4, 'economy': -1, 'satisfaction': 1}
                    },
                    {
                        'text': 'Focar em policiamento comunitário',
                        'effects': {'security': 3, 'satisfaction': 4, 'culture': 2}
                    }
                ],
                'category': 'seguranca'
            }
        ]
        
        for decision_data in default_decisions:
            decision = Decision(
                title=decision_data['title'],
                description=decision_data['description'],
                options=decision_data['options'],
                category=decision_data['category']
            )
            db.session.add(decision)
        
        try:
            db.session.commit()
        except:
            db.session.rollback()

