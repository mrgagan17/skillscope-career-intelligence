import json
from flask import Blueprint, send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, CareerRecommendation
from app.services.report_service import generate_pdf_report
from app.routes.career import analyze_role_market_skills
from app.utils.parser import calculate_match_score
from app.services.ai_service import AIService

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/download', methods=['GET'])
@jwt_required()
def download_pdf_report():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    target_role = user.target_role or "Data Analyst"
    user_skills = user.user_skills.split(',') if user.user_skills else []
    
    # 1. Gather Market and Gap Analysis stats
    market_skills, avg_salary = analyze_role_market_skills(target_role)
    score, missing = calculate_match_score(user_skills, market_skills)
    
    metrics = {
        "readiness_score": score,
        "missing_skills": missing,
        "avg_salary": avg_salary
    }
    
    # 2. Retrieve AI Advice
    # Get latest saved, or generate on-the-fly
    rec = CareerRecommendation.query.filter_by(user_id=user.id).order_by(CareerRecommendation.created_at.desc()).first()
    if rec:
        try:
            advice_json = json.loads(rec.recommendation_text)
            roadmap_json = json.loads(rec.roadmap) if rec.roadmap else []
            advice = {
                "summary": advice_json.get('summary', ''),
                "learning_priorities": advice_json.get('learning_priorities', []),
                "roadmap": roadmap_json,
                "job_strategy": advice_json.get('job_strategy', [])
            }
        except:
            rec = None
            
    if not rec:
        # Generate on the fly
        ai_service = AIService()
        advice = ai_service.generate_career_advice(
            target_role=target_role,
            user_skills=user_skills,
            missing_skills=missing,
            avg_salary=avg_salary
        )
        
    # 3. Generate PDF
    pdf_buffer = generate_pdf_report(user.to_dict(), metrics, advice)
    
    # Send PDF back as download attachment
    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"SkillScope_{target_role.replace(' ', '_')}_Report.pdf"
    )
