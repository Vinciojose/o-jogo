import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models import db, State, Decision
from src.routes.states import states_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'brasilsim-secret-key-2024'

# Habilita CORS para todas as rotas
CORS(app)

# Registra as rotas da API
app.register_blueprint(states_bp, url_prefix='/api')

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Inicializa o banco de dados
with app.app_context():
    db.create_all()
    # Cria decisões padrão se não existirem
    if Decision.query.count() == 0:
        Decision.create_default_decisions()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve arquivos estáticos e SPA"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    print("🇧🇷 BrasilSim - Simulador Político Brasileiro")
    print("🚀 Servidor iniciando em http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)

