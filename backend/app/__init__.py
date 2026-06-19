import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.models import db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend running on port 5173
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Enable JWT extensions
    jwt = JWTManager(app)
    
    # Bind database
    db.init_app(app)

    # Import and register blueprints
    from app.routes.auth import auth_bp
    from app.routes.analytics import analytics_bp
    from app.routes.career import career_bp
    from app.routes.resume import resume_bp
    from app.routes.reports import reports_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(career_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(reports_bp)

    # Create upload directories if not exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    with app.app_context():
        try:
            print("Creating database tables if not exist...")
            db.create_all()
            
            # Run ETL process to populate jobs dataset
            from data.processor import run_etl_pipeline
            run_etl_pipeline()
        except Exception as e:
            print(f"Error initializing database / seeding data: {e}")

    return app
