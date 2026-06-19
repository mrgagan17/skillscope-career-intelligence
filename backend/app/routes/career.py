import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
from sqlalchemy import text
from app.models import db, User, CareerRecommendation, Job, Skill, job_skills
from app.services.ai_service import AIService
from app.utils.parser import calculate_match_score

career_bp = Blueprint('career', __name__, url_prefix='/api/career')

def analyze_role_market_skills(target_role: str) -> tuple:
    """
    Analyzes job listings for a target role to find the top 10 skills
    demanded by the market and the average salary.
    """
    # Query database and load to Pandas
    query = """
        SELECT j.id, j.salary_min, j.salary_max
        FROM jobs j
        WHERE j.title = :title
    """
    conn = db.session.connection()
    df_jobs = pd.read_sql(text(query), conn, params={"title": target_role})
    
    if df_jobs.empty:
        # Fallback to general stats if role not found
        df_jobs = pd.read_sql(text("SELECT id, salary_min, salary_max FROM jobs"), conn)
        
    df_jobs['midpoint'] = (df_jobs['salary_min'] + df_jobs['salary_max']) / 2
    avg_salary = float(df_jobs['midpoint'].mean()) if not df_jobs.empty else 75000.0
    
    # Get skill counts for this role
    query_skills = """
        SELECT s.name, COUNT(*) as frequency
        FROM job_skills js
        JOIN jobs j ON js.job_id = j.id
        JOIN skills s ON js.skill_id = s.id
        WHERE j.title = :title
        GROUP BY s.name
        ORDER BY frequency DESC
        LIMIT 10
    """
    df_role_skills = pd.read_sql(text(query_skills), conn, params={"title": target_role})
    
    if df_role_skills.empty:
        # Generic fallback skills if none found
        market_skills = ["Python", "SQL", "Excel", "Data Visualization", "Communication", "Problem Solving", "Git", "Agile"]
    else:
        market_skills = df_role_skills['name'].tolist()
        
    return market_skills, avg_salary

@career_bp.route('/gap-analysis', methods=['POST'])
def gap_analysis():
    """
    Unprotected/public gap analysis endpoint for instant homepage/widget use.
    Input JSON: { "target_role": "Data Analyst", "skills": ["Python", "SQL", "Tableau"] }
    """
    data = request.get_json() or {}
    target_role = data.get('target_role', 'Data Analyst')
    user_skills = data.get('skills', [])
    
    if isinstance(user_skills, str):
        user_skills = [s.strip() for s in user_skills.split(',') if s.strip()]
        
    market_skills, avg_salary = analyze_role_market_skills(target_role)
    score, missing = calculate_match_score(user_skills, market_skills)
    
    return jsonify({
        "target_role": target_role,
        "user_skills": user_skills,
        "market_skills": market_skills,
        "missing_skills": missing,
        "readiness_score": score,
        "avg_salary": round(avg_salary, 2)
    }), 200

@career_bp.route('/recommendations', methods=['GET', 'POST'])
@jwt_required()
def recommendations():
    """
    Protected endpoint to query or generate Gemini-based career advisories.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    # GET: Retrieve latest saved recommendation if exists and not requested regeneration
    if request.method == 'GET' and not request.args.get('refresh'):
        rec = CareerRecommendation.query.filter_by(user_id=user.id).order_details = CareerRecommendation.query.filter_by(user_id=user.id).order_by(CareerRecommendation.created_at.desc()).first()
        if rec:
            try:
                return jsonify({
                    "id": rec.id,
                    "target_role": user.target_role,
                    "user_skills": user.user_skills.split(',') if user.user_skills else [],
                    "created_at": rec.created_at.isoformat(),
                    "recommendations": json.loads(rec.recommendation_text),
                    "roadmap_data": json.loads(rec.roadmap) if rec.roadmap else {}
                }), 200
            except Exception as e:
                # If JSON parsing fail, rebuild
                pass
                
    # POST/Regeneration logic
    target_role = user.target_role or "Data Analyst"
    user_skills = user.user_skills.split(',') if user.user_skills else []
    
    # 1. Fetch Market stats
    market_skills, avg_salary = analyze_role_market_skills(target_role)
    score, missing = calculate_match_score(user_skills, market_skills)
    
    # 2. Invoke AI Advisor service
    ai_service = AIService()
    advice = ai_service.generate_career_advice(
        target_role=target_role,
        user_skills=user_skills,
        missing_skills=missing,
        avg_salary=avg_salary
    )
    
    # Parse roadmap vs other advice
    roadmap_data = advice.get('roadmap', [])
    recommendations_json = {
        "summary": advice.get('summary', ''),
        "learning_priorities": advice.get('learning_priorities', []),
        "job_strategy": advice.get('job_strategy', []),
        "readiness_score": score,
        "missing_skills": missing,
        "avg_salary": avg_salary
    }
    
    # 3. Save to database
    rec = CareerRecommendation(
        user_id=user.id,
        recommendation_text=json.dumps(recommendations_json),
        roadmap=json.dumps(roadmap_data)
    )
    
    try:
        db.session.add(rec)
        db.session.commit()
        
        return jsonify({
            "id": rec.id,
            "target_role": target_role,
            "user_skills": user_skills,
            "created_at": rec.created_at.isoformat(),
            "recommendations": recommendations_json,
            "roadmap_data": roadmap_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error saving recommendations: {str(e)}"}), 500
