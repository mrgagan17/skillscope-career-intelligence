import os
import json
import google.generativeai as genai

class AIService:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")
        self.client_enabled = False
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.client_enabled = True
                print("Gemini API Client successfully initialized.")
            except Exception as e:
                print(f"Failed to initialize Gemini API Client: {e}")

    def generate_career_advice(self, target_role: str, user_skills: list, missing_skills: list, avg_salary: float) -> dict:
        """
        Generates personalized career recommendations and learning roadmaps.
        Queries Gemini API if available, otherwise generates a high-quality simulated response.
        """
        skills_str = ", ".join(user_skills) if user_skills else "None"
        missing_str = ", ".join(missing_skills) if missing_skills else "None"
        
        prompt = (
            f"You are SkillScope AI, an expert Career Advisor and Data Analyst Coach.\n"
            f"Provide a career evaluation for a user aiming to be a '{target_role}'.\n"
            f"User's current skills: {skills_str}.\n"
            f"Detected missing key market skills for this role: {missing_str}.\n"
            f"Market average salary for this role is around: ${avg_salary:,.2f}.\n\n"
            f"Please generate a complete development plan in JSON format. Do not include markdown code block formatting except the raw json output. The JSON must contain these exact keys:\n"
            f"- 'summary': A professional assessment of their current market readiness.\n"
            f"- 'learning_priorities': A list of top 3 skills to learn first and why.\n"
            f"- 'roadmap': A list of 3 items (Month 1, Month 2, Month 3) detailing what to study, projects to build, and certification paths.\n"
            f"- 'job_strategy': A list of 3 tips on tailoring their resume and portfolio for this role.\n"
        )
        
        if self.client_enabled:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                
                # Clean response to parse JSON
                text = response.text.strip()
                # Remove markdown fences if model outputs them
                if text.startswith("```json"):
                    text = text.replace("```json", "", 1)
                if text.endswith("```"):
                    text = text[:-3].strip()
                text = text.strip()
                
                return json.loads(text)
            except Exception as e:
                print(f"Gemini API execution error: {e}. Falling back to simulator.")
                
        return self._generate_simulated_career_advice(target_role, user_skills, missing_skills, avg_salary)

    def generate_resume_feedback(self, target_role: str, extracted_skills: list, match_score: float, missing_skills: list) -> dict:
        """
        Evaluates an uploaded resume and suggests layout, content, and skill enhancements.
        Queries Gemini API if available, otherwise generates a high-quality simulated response.
        """
        skills_str = ", ".join(extracted_skills) if extracted_skills else "None detected"
        missing_str = ", ".join(missing_skills) if missing_skills else "None"
        
        prompt = (
            f"You are a Senior Technical Recruiter and Career Intelligence Engine.\n"
            f"Analyze this resume profile for a '{target_role}' target job:\n"
            f"- Extracted Skills: {skills_str}\n"
            f"- Calculated Market Alignment Score: {match_score}%\n"
            f"- Critical Missing Skills: {missing_str}\n\n"
            f"Provide a structured critique in JSON format. Do not use markdown wraps around JSON. The JSON must have these exact keys:\n"
            f"- 'critique': A summary of resume strengths and weaknesses.\n"
            f"- 'formatting_tips': List of 3 improvements for layout/structure.\n"
            f"- 'actionable_upgrades': List of 3 concrete changes to make to bullet points or project descriptions.\n"
            f"- 'impact_score': An estimated index (0-100) of how competitive this resume is."
        )
        
        if self.client_enabled:
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                response = model.generate_content(prompt)
                
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text.replace("```json", "", 1)
                if text.endswith("```"):
                    text = text[:-3].strip()
                text = text.strip()
                
                return json.loads(text)
            except Exception as e:
                print(f"Gemini API execution error for resume: {e}. Falling back to simulator.")
                
        return self._generate_simulated_resume_feedback(target_role, extracted_skills, match_score, missing_skills)

    def _generate_simulated_career_advice(self, role: str, user_skills: list, missing_skills: list, avg_salary: float) -> dict:
        """
        Generates realistic advice matching inputs when API is unavailable.
        """
        score = 100 - (len(missing_skills) * 12)
        score = max(min(score, 95), 15)
        
        prio_skills = missing_skills[:3] if missing_skills else ["Advanced System Architecture", "Data Structures", "Mocking & Testing"]
        while len(prio_skills) < 3:
            prio_skills.append("System Integration")
            
        return {
            "summary": f"Your current alignment with the {role} role is estimated at {score}%. You have a solid starting base in key areas, but addressing critical technology gaps will significantly increase your market value and visibility to recruiters.",
            "learning_priorities": [
                f"Master {prio_skills[0]} - This skill is present in over 70% of current job listings. Dedicate 2 weeks to core fundamentals and integration tasks.",
                f"Acquire proficiency in {prio_skills[1]} - Crucial for handling core production pipelines and demonstrating professional competencies.",
                f"Develop projects with {prio_skills[2]} - Building hands-on proof-of-concept projects will prove your abilities to hiring managers."
            ],
            "roadmap": [
                f"Month 1: Focus heavily on building deep familiarity with {prio_skills[0]} and {prio_skills[1]}. Build 3 micro-projects validating data pipelines or structural layout.",
                "Month 2: Implement advanced integrations, clean architecture principles, and build a full-scale portfolio project incorporating cloud deployments or database normalization.",
                f"Month 3: Tailor your portfolio to feature {role} roles, start contributing to open source, prepare for technical interviews covering algorithms, and practice mock challenges."
            ],
            "job_strategy": [
                f"Format your resume to highlight analytical outcomes, e.g., 'Optimized pipeline using {user_skills[0] if user_skills else 'SQL'} to reduce latency by 20%'.",
                f"Design a dedicated portfolio website displaying interactive dashboards and links to GitHub repositories showing clean code.",
                f"Actively network with professionals in the {role} field and seek referrals for entry-level positions to bypass automated systems."
            ]
        }

    def _generate_simulated_resume_feedback(self, role: str, extracted_skills: list, match_score: float, missing_skills: list) -> dict:
        """
        Generates realistic resume feedback when API is unavailable.
        """
        prio_skills = missing_skills[:2] if missing_skills else ["System Architecture", "Professional Testing Frameworks"]
        
        return {
            "critique": f"Your resume successfully highlights key skillsets, resulting in a market readiness score of {match_score}%. However, to stand out for competitive {role} vacancies, you need to clearly document practical experience with modern data ecosystems and state-of-the-art frameworks.",
            "formatting_tips": [
                "Position your technical skills section at the top, categorized by Languages, Databases, and Tools to ensure instant scanning.",
                "Keep the design clean and clean-cut, utilizing a single-column format with standard 0.75-inch margins for ATS parsing compliance.",
                "Use bold formatting selectively on key metrics, tool names, and job titles to guide the reader's eye."
            ],
            "actionable_upgrades": [
                f"Rewrite bullet points using the STAR method: Action + Context + Result (e.g. 'Leveraged {extracted_skills[0] if extracted_skills else 'analytical skills'} to improve reporting accuracy by 15%').",
                f"Add a dedicated project section outlining your SkillScope platform, detailing your utilization of Pandas, NumPy, and Flask REST APIs.",
                f"Incorporate the missing skills: {', '.join(prio_skills)} in your projects descriptions to increase ATS search density."
            ],
            "impact_score": int(match_score * 0.9 + 5)
        }
