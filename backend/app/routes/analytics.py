from flask import Blueprint, jsonify, request
import pandas as pd
import numpy as np
from sqlalchemy import text
from app.models import db, Job, Skill, Location, Company, job_skills

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

def get_full_jobs_dataframe():
    """
    Helper function to load the entire jobs dataset and skills mapping 
    into Pandas DataFrames for complex and fast in-memory analytical operations.
    """
    # 1. Fetch jobs and merge with locations and companies
    query_jobs = """
        SELECT j.id, j.title, j.salary_min, j.salary_max, j.experience_level, 
               j.job_type, j.posting_date, j.industry, l.city, l.state, l.remote_friendly, c.name as company_name
        FROM jobs j
        JOIN locations l ON j.location_id = l.id
        JOIN companies c ON j.company_id = c.id
    """
    jobs_conn = db.session.connection()
    df_jobs = pd.read_sql(text(query_jobs), jobs_conn)
    
    # Clean and feature engineer midpoint
    df_jobs['posting_date'] = pd.to_datetime(df_jobs['posting_date'])
    df_jobs['salary_midpoint'] = (df_jobs['salary_min'] + df_jobs['salary_max']) / 2
    
    # 2. Fetch skill mapping
    query_skills = """
        SELECT js.job_id, s.id as skill_id, s.name as skill_name, s.category as skill_category
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
    """
    df_skills_mapping = pd.read_sql(text(query_skills), jobs_conn)
    
    return df_jobs, df_skills_mapping

@analytics_bp.route('/overview', methods=['GET'])
def get_overview():
    try:
        df_jobs, df_skills = get_full_jobs_dataframe()
        
        if df_jobs.empty:
            return jsonify({
                "total_jobs": 0, "total_skills": 0, "avg_salary": 0,
                "top_skill": "None", "fastest_growing_role": "None"
            }), 200
            
        total_jobs = len(df_jobs)
        total_skills_detected = df_skills['skill_name'].nunique()
        avg_salary = float(df_jobs['salary_midpoint'].mean())
        
        # Most in-demand skill (frequency)
        top_skill = df_skills['skill_name'].value_counts().idxmax() if not df_skills.empty else "N/A"
        
        # Fastest growing technology (role/tech by comparing last 3 months vs previous 3 months)
        # For simplicity in calculations, pick AI Engineer growth rate or calculate
        df_jobs['month'] = df_jobs['posting_date'].dt.to_period('M')
        last_month = df_jobs['month'].max()
        prev_month = last_month - 1
        
        jobs_last = df_jobs[df_jobs['month'] == last_month]
        jobs_prev = df_jobs[df_jobs['month'] == prev_month]
        
        growth_roles = "AI Engineer"  # default
        if len(jobs_prev) > 0 and len(jobs_last) > 0:
            last_counts = jobs_last['title'].value_counts()
            prev_counts = jobs_prev['title'].value_counts()
            
            growth_rates = {}
            for role in last_counts.index:
                if role in prev_counts and prev_counts[role] > 0:
                    growth_rates[role] = (last_counts[role] - prev_counts[role]) / prev_counts[role]
            if growth_rates:
                growth_roles = max(growth_rates, key=growth_rates.get)
                
        return jsonify({
            "total_jobs": total_jobs,
            "total_skills": total_skills_detected,
            "avg_salary": round(avg_salary, 2),
            "top_skill": top_skill,
            "fastest_growing_role": growth_roles
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Analytics overview load error: {str(e)}"}), 500

@analytics_bp.route('/skills', methods=['GET'])
def get_skills_analysis():
    try:
        role_filter = request.args.get('role')
        df_jobs, df_skills = get_full_jobs_dataframe()
        
        # Apply role filter if passed
        if role_filter:
            df_jobs = df_jobs[df_jobs['title'] == role_filter]
            df_skills = df_skills[df_skills['job_id'].isin(df_jobs['id'])]
            
        if df_skills.empty:
            return jsonify({"top_skills": [], "categories": [], "trends": []}), 200
            
        # 1. Top 20 Most Requested Skills
        top_skills = df_skills['skill_name'].value_counts().head(20)
        top_skills_list = [{"name": name, "count": int(count)} for name, count in top_skills.items()]
        
        # 2. Skill Categories Pie Chart
        category_counts = df_skills['skill_category'].value_counts()
        categories_list = [{"name": cat, "value": int(val)} for cat, val in category_counts.items()]
        
        # 3. Skill Popularity Trends (Monthly occurrences of top 5 skills)
        df_merged = df_skills.merge(df_jobs[['id', 'posting_date']], left_on='job_id', right_on='id')
        df_merged['month'] = df_merged['posting_date'].dt.strftime('%Y-%m')
        
        top_5_skills = list(top_skills.head(5).index)
        
        # Create a monthly cross-tabulation table for the top 5 skills
        df_trends = df_merged[df_merged['skill_name'].isin(top_5_skills)]
        trend_pivot = pd.crosstab(df_trends['month'], df_trends['skill_name']).reset_index()
        
        # Convert trends to JSON list
        trend_list = trend_pivot.to_dict(orient='records')
        
        # 4. Emerging Tech: skills showing rapid percentage growth in the last 6 months
        # Group by first 9 months vs last 9 months
        median_date = df_merged['posting_date'].min() + (df_merged['posting_date'].max() - df_merged['posting_date'].min()) / 2
        df_early = df_merged[df_merged['posting_date'] < median_date]
        df_late = df_merged[df_merged['posting_date'] >= median_date]
        
        early_counts = df_early['skill_name'].value_counts()
        late_counts = df_late['skill_name'].value_counts()
        
        emerging = []
        for skill in late_counts.index:
            late_val = late_counts[skill]
            early_val = early_counts.get(skill, 0)
            
            # Filter for skills that are starting to show up (e.g. late > 50 and early was low)
            if late_val > 50:
                growth = (late_val - early_val) / max(early_val, 1)
                emerging.append({"name": skill, "growth": round(growth * 100, 1), "current_demand": int(late_val)})
                
        # Sort emerging by highest growth and get top 8
        emerging_sorted = sorted(emerging, key=lambda x: x['growth'], reverse=True)[:8]
        
        return jsonify({
            "top_skills": top_skills_list,
            "categories": categories_list,
            "trends": trend_list,
            "emerging_tech": emerging_sorted
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Skills analysis error: {str(e)}"}), 500

@analytics_bp.route('/salaries', methods=['GET'])
def get_salary_analysis():
    try:
        role_filter = request.args.get('role')
        df_jobs, _ = get_full_jobs_dataframe()
        
        if role_filter:
            df_jobs = df_jobs[df_jobs['title'] == role_filter]
            
        if df_jobs.empty:
            return jsonify({"distribution": [], "by_role": [], "by_location": [], "experience": []}), 200
            
        # 1. Salary Distribution (Histogram binning)
        # Bin salaries from 40k to 260k into 12 bins
        bins = np.linspace(40000, 260000, 12)
        counts, bin_edges = np.histogram(df_jobs['salary_midpoint'], bins=bins)
        
        dist_list = []
        for i in range(len(counts)):
            label = f"${int(bin_edges[i]/1000)}k-${int(bin_edges[i+1]/1000)}k"
            dist_list.append({"range": label, "jobs": int(counts[i])})
            
        # 2. Average Salary by Role
        role_salaries = df_jobs.groupby('title')['salary_midpoint'].agg(['mean', 'min', 'max']).reset_index()
        role_salaries = role_salaries.sort_values(by='mean', ascending=False)
        role_list = [{
            "role": row['title'],
            "avg_salary": round(row['mean'], 2),
            "min_salary": float(row['min']),
            "max_salary": float(row['max'])
        } for _, row in role_salaries.iterrows()]
        
        # 3. Average Salary by Location (top 15 cities)
        loc_salaries = df_jobs.groupby(['city', 'state'])['salary_midpoint'].mean().reset_index()
        loc_salaries = loc_salaries.sort_values(by='salary_midpoint', ascending=False).head(15)
        loc_list = [{
            "location": f"{row['city']}, {row['state']}",
            "avg_salary": round(row['salary_midpoint'], 2)
        } for _, row in loc_salaries.iterrows()]
        
        # 4. Experience Level vs Salary Analysis
        exp_salaries = df_jobs.groupby('experience_level')['salary_midpoint'].agg(['mean', 'min', 'max']).reset_index()
        # Sort custom order
        order = {"Entry-level": 0, "Mid-level": 1, "Senior-level": 2}
        exp_salaries['order'] = exp_salaries['experience_level'].map(order)
        exp_salaries = exp_salaries.sort_values('order').drop('order', axis=1)
        
        exp_list = [{
            "level": row['experience_level'],
            "avg_salary": round(row['mean'], 2),
            "min_salary": float(row['min']),
            "max_salary": float(row['max'])
        } for _, row in exp_salaries.iterrows()]
        
        # Sample 200 jobs for scatter plot (salary vs posting date or experience level)
        scatter_df = df_jobs.sample(min(200, len(df_jobs)))
        scatter_list = [{
            "id": int(row['id']),
            "title": row['title'],
            "salary": float(row['salary_midpoint']),
            "experience": row['experience_level'],
            "industry": row['industry']
        } for _, row in scatter_df.iterrows()]
        
        return jsonify({
            "distribution": dist_list,
            "by_role": role_list,
            "by_location": loc_list,
            "experience": exp_list,
            "scatter_data": scatter_list
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Salary analysis error: {str(e)}"}), 500

@analytics_bp.route('/hiring', methods=['GET'])
def get_hiring_trends():
    try:
        role_filter = request.args.get('role')
        df_jobs, df_skills = get_full_jobs_dataframe()
        
        if role_filter:
            df_jobs = df_jobs[df_jobs['title'] == role_filter]
            
        if df_jobs.empty:
            return jsonify({"monthly_trends": [], "industry_share": []}), 200
            
        # 1. Monthly Hiring Volume
        df_jobs['month'] = df_jobs['posting_date'].dt.strftime('%Y-%m')
        monthly_counts = df_jobs.groupby('month').size().reset_index(name='job_count')
        monthly_counts = monthly_counts.sort_values('month')
        
        # Calculate Month-over-Month Growth Rate
        monthly_counts['growth_rate'] = monthly_counts['job_count'].pct_change() * 100
        monthly_counts['growth_rate'] = monthly_counts['growth_rate'].fillna(0.0).round(2)
        
        monthly_list = monthly_counts.to_dict(orient='records')
        
        # 2. Industry-wise Hiring Breakdown
        ind_counts = df_jobs['industry'].value_counts()
        ind_list = [{"name": ind, "value": int(val)} for ind, val in ind_counts.items()]
        
        # 3. Technology Adoption trends (grouped categories over time)
        # Count skills in categories over months
        df_merged = df_skills.merge(df_jobs[['id', 'posting_date']], left_on='job_id', right_on='id')
        df_merged['month'] = df_merged['posting_date'].dt.strftime('%Y-%m')
        
        tech_trends = pd.crosstab(df_merged['month'], df_merged['skill_category']).reset_index()
        tech_trends_list = tech_trends.to_dict(orient='records')
        
        return jsonify({
            "monthly_trends": monthly_list,
            "industry_share": ind_list,
            "tech_adoption": tech_trends_list
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Hiring trends error: {str(e)}"}), 500

@analytics_bp.route('/locations', methods=['GET'])
def get_location_analytics():
    try:
        role_filter = request.args.get('role')
        df_jobs, _ = get_full_jobs_dataframe()
        
        if role_filter:
            df_jobs = df_jobs[df_jobs['title'] == role_filter]
            
        if df_jobs.empty:
            return jsonify({"by_city": [], "remote_ratio": [], "by_state": []}), 200
            
        # 1. Top 10 cities by job counts
        city_counts = df_jobs['city'].value_counts().head(10)
        city_list = [{"name": city, "jobs": int(count)} for city, count in city_counts.items()]
        
        # 2. Remote vs Onsite Analysis
        # Determine remote status (if job_type is Remote or Location remote_friendly is True)
        is_remote = (df_jobs['job_type'] == 'Remote') | (df_jobs['remote_friendly'] == 1)
        remote_counts = is_remote.value_counts()
        remote_ratio_list = [
            {"name": "Remote", "value": int(remote_counts.get(True, 0))},
            {"name": "Onsite/Hybrid", "value": int(remote_counts.get(False, 0))}
        ]
        
        # 3. State-wise Opportunities (for SVG map coloring)
        state_counts = df_jobs['state'].value_counts()
        state_list = [{"state": state, "jobs": int(count)} for state, count in state_counts.items()]
        
        return jsonify({
            "by_city": city_list,
            "remote_ratio": remote_ratio_list,
            "by_state": state_list
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Location analytics error: {str(e)}"}), 500

@analytics_bp.route('/roles', methods=['GET'])
def get_available_roles():
    """
    Utility endpoint for dropdown selectors
    """
    try:
        roles = db.session.query(Job.title).distinct().all()
        roles_list = [r[0] for r in roles]
        return jsonify(roles_list), 200
    except Exception as e:
        return jsonify({"message": f"Roles fetch error: {str(e)}"}), 500
