import re
from pypdf import PdfReader

def extract_text_from_pdf(stream) -> str:
    """
    Extracts raw text from a PDF file stream using pypdf.
    """
    try:
        reader = PdfReader(stream)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def parse_resume_text(text: str, available_skills: list) -> list:
    """
    Matches text against a list of known skills.
    Performs clean matching (word boundaries for short strings like C, R, Go, AWS).
    """
    if not text:
        return []
    
    # Standardize resume text
    text_clean = text.lower()
    
    matched_skills = []
    for skill in available_skills:
        skill_clean = skill.strip().lower()
        if not skill_clean:
            continue
            
        # If the skill is very short (e.g. R, C, Go, Git, SQL, AWS, CSS), match on word boundaries only
        if len(skill_clean) <= 3 or skill_clean in ["java", "rust", "html", "saas", "scrum", "agile", "spark"]:
            # Escape regex characters
            pattern = rf"\b{re.escape(skill_clean)}\b"
            if re.search(pattern, text_clean):
                matched_skills.append(skill)
        else:
            # Substring match is okay for longer multi-word skills like "machine learning" or "data visualization"
            if skill_clean in text_clean:
                matched_skills.append(skill)
                
    return list(set(matched_skills))

def calculate_match_score(user_skills: list, target_role_skills: list) -> tuple:
    """
    Compares user's skills against standard target role skills.
    Returns: (match_score 0-100, missing_skills list)
    """
    if not target_role_skills:
        return 0.0, []
        
    user_set = {s.lower().strip() for s in user_skills}
    target_set = {s.lower().strip() for s in target_role_skills}
    
    matched = user_set.intersection(target_set)
    missing = [s for s in target_role_skills if s.lower().strip() not in user_set]
    
    score = (len(matched) / len(target_set)) * 100
    return round(score, 1), missing
