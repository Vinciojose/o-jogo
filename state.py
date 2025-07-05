from datetime import datetime
import json
from . import db

class State(db.Model):
    """
    Modelo de Estado - representa um estado fictício criado pelo jogador
    """
    __tablename__ = 'states'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    region = db.Column(db.String(50), nullable=False)
    government_type = db.Column(db.String(50), nullable=False)
    
    # Indicadores do estado (0-100)
    economy = db.Column(db.Integer, default=50)
    education = db.Column(db.Integer, default=50)
    health = db.Column(db.Integer, default=50)
    security = db.Column(db.Integer, default=50)
    culture = db.Column(db.Integer, default=50)
    satisfaction = db.Column(db.Integer, default=50)
    corruption = db.Column(db.Integer, default=50)
    
    # Metadados
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_decision = db.Column(db.DateTime, default=datetime.utcnow)
    decisions_count = db.Column(db.Integer, default=0)
    
    def __init__(self, name, region, government_type):
        self.name = name
        self.region = region
        self.government_type = government_type
    
    def to_dict(self):
        """Converte o estado para dicionário"""
        return {
            'id': self.id,
            'name': self.name,
            'region': self.region,
            'government_type': self.government_type,
            'indicators': {
                'economy': self.economy,
                'education': self.education,
                'health': self.health,
                'security': self.security,
                'culture': self.culture,
                'satisfaction': self.satisfaction,
                'corruption': self.corruption
            },
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_decision': self.last_decision.isoformat() if self.last_decision else None,
            'decisions_count': self.decisions_count
        }
    
    def apply_decision_effects(self, effects):
        """Aplica os efeitos de uma decisão aos indicadores"""
        for indicator, change in effects.items():
            if hasattr(self, indicator):
                current_value = getattr(self, indicator)
                new_value = max(0, min(100, current_value + change))
                setattr(self, indicator, new_value)
        
        self.last_decision = datetime.utcnow()
        self.decisions_count += 1
    
    def get_status_message(self):
        """Retorna uma mensagem de status baseada nos indicadores"""
        avg_satisfaction = (self.satisfaction + self.economy + self.education + self.health) / 4
        
        if avg_satisfaction >= 80:
            return "Seu povo está feliz da vida! 🎉"
        elif avg_satisfaction >= 60:
            return "As coisas estão indo bem por aí! 👍"
        elif avg_satisfaction >= 40:
            return "O povo está meio desconfiado... 🤔"
        elif avg_satisfaction >= 20:
            return "Seu povo tá pistola com você! 😠"
        else:
            return "Revolução à vista! Cuidado! 🔥"
    
    @staticmethod
    def get_regions():
        """Retorna as regiões disponíveis"""
        return [
            'Norte',
            'Nordeste', 
            'Centro-Oeste',
            'Sudeste',
            'Sul'
        ]
    
    @staticmethod
    def get_government_types():
        """Retorna os tipos de governo disponíveis"""
        return [
            'Democracia',
            'Tecnocracia',
            'Coronelismo',
            'Populismo',
            'Autoritarismo'
        ]

