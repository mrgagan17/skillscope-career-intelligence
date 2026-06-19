from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User
from app.utils.security import hash_password, check_password

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    target_role = data.get('target_role', 'Data Analyst')
    user_skills = data.get('user_skills', '')
    
    if not username or not email or not password:
        return jsonify({"message": "Username, email, and password are required"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email is already registered"}), 409
        
    pwd_hash = hash_password(password)
    user = User(
        username=username,
        email=email,
        password_hash=pwd_hash,
        target_role=target_role,
        user_skills=user_skills
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error saving user: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
        
    user = User.query.filter_by(email=email).first()
    if not user or not check_password(user.password_hash, password):
        return jsonify({"message": "Invalid email or password"}), 401
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if request.method == 'GET':
        return jsonify(user.to_dict()), 200
        
    elif request.method == 'PUT':
        data = request.get_json() or {}
        username = data.get('username')
        target_role = data.get('target_role')
        user_skills = data.get('user_skills')
        password = data.get('password')
        
        if username:
            user.username = username
        if target_role:
            user.target_role = target_role
        if user_skills is not None:
            # If input is a list, join with comma
            if isinstance(user_skills, list):
                user.user_skills = ",".join(user_skills)
            else:
                user.user_skills = str(user_skills)
                
        if password:
            user.password_hash = hash_password(password)
            
        try:
            db.session.commit()
            return jsonify({
                "message": "Profile updated successfully",
                "user": user.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Error updating profile: {str(e)}"}), 500
