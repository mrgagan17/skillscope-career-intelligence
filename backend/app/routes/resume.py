import os
import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app.models import db, User, ResumeAnalysis, Skill
from app.utils.parser import extract_text_from_pdf, parse_resume_text, calculate_match_score
from app.services.ai_service import AIService
from app.routes.career import analyze_role_market_skills

resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')

ALLOWED_EXTENSIONS = {'pdf', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_bp.route('/scan', methods=['POST'])
@jwt_required()
def scan_resume():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No file selected for uploading"}), 400
        
    if not allowed_file(file.filename):
        return jsonify({"message": "Unsupported file format. Please upload PDF or TXT files."}), 400
        
    filename = secure_filename(file.filename)
    
    # Read text
    text_content = ""
    try:
        file_ext = filename.rsplit('.', 1)[1].lower()
        if file_ext == 'pdf':
            text_content = extract_text_from_pdf(file.stream)
        elif file_ext == 'txt':
            text_content = file.stream.read().decode('utf-8', errors='ignore')
    except Exception as e:
        return jsonify({"message": f"Failed to extract text from file: {str(e)}"}), 500
        
    if not text_content.strip():
        return jsonify({"message": "The file contains no readable text content."}), 422
        
    # Get all available skills in database to match against
    try:
        skills_query = db.session.query(Skill.name).all()
        available_skills = [s[0] for s in skills_query]
    except Exception as e:
        available_skills = ["Python", "SQL", "Tableau", "Excel", "Machine Learning", "React", "AWS", "Git"]
        
    # Match resume text against skill database
    extracted_skills = parse_resume_text(text_content, available_skills)
    
    # Analyze against target role
    target_role = user.target_role or "Data Analyst"
    market_skills, avg_salary = analyze_role_market_skills(target_role)
    
    # Compute readiness score
    match_score, missing_skills = calculate_match_score(extracted_skills, market_skills)
    
    # Request Gemini resume reviews
    ai_service = AIService()
    review = ai_service.generate_resume_feedback(
        target_role=target_role,
        extracted_skills=extracted_skills,
        match_score=match_score,
        missing_skills=missing_skills
    )
    
    # Save analysis database
    analysis = ResumeAnalysis(
        user_id=user.id,
        filename=filename,
        raw_text=text_content[:2000],  # Save snippet to save space
        extracted_skills=",".join(extracted_skills),
        match_score=match_score,
        recommendations=json.dumps(review)
    )
    
    try:
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            "id": analysis.id,
            "filename": filename,
            "extracted_skills": extracted_skills,
            "target_role": target_role,
            "match_score": match_score,
            "missing_skills": missing_skills,
            "review": review,
            "created_at": analysis.created_at.isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error saving resume analysis: {str(e)}"}), 500

@resume_bp.route('/history', methods=['GET'])
@jwt_required()
def get_resume_history():
    user_id = get_jwt_identity()
    history = ResumeAnalysis.query.filter_by(user_id=user_id).order_by(ResumeAnalysis.created_at.desc()).all()
    
    history_list = []
    for h in history:
        try:
            rec_json = json.loads(h.recommendations) if h.recommendations else {}
        except:
            rec_json = {}
            
        history_list.append({
            "id": h.id,
            "filename": h.filename,
            "extracted_skills": h.extracted_skills.split(',') if h.extracted_skills else [],
            "match_score": h.match_score,
            "review": rec_json,
            "created_at": h.created_at.isoformat()
        })
        
    return jsonify(history_list), 200
