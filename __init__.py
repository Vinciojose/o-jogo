from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Importa todos os modelos para garantir que sejam registrados
from .state import State
from .decision import Decision

