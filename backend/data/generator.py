import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def generate_companies(n=520):
    prefixes = ["Apex", "Innova", "Quantum", "Vertex", "Cyber", "Data", "Cloud", "Bio", "Fin", "Blue", 
                "Silver", "Gold", "Stellar", "Core", "Nexus", "Synergy", "Alpha", "Omni", "Delta", "Matrix"]
    suffixes = ["Corp", "Systems", "Technologies", "Solutions", "Labs", "Analytics", "Software", 
                "Group", "Partners", "Global", "Networks", "Industries", "Ventures", "Consulting"]
    industries = ["Technology", "Finance", "Healthcare", "E-commerce", "Automotive", "Entertainment", "Energy", "Retail", "Education", "Telecommunications"]
    sizes = ["10-50", "51-200", "201-500", "501-1000", "1000-5000", "5000+"]
    
    companies = []
    # Make sure we generate exactly n unique company names
    used_names = set()
    while len(companies) < n:
        mid = f" {random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}" if random.random() < 0.4 else ""
        name = f"{random.choice(prefixes)}{mid} {random.choice(suffixes)}"
        if name not in used_names:
            used_names.add(name)
            companies.append({
                "id": len(companies) + 1,
                "name": name,
                "industry": random.choice(industries),
                "size": random.choice(sizes)
            })
    return pd.DataFrame(companies)

def generate_locations():
    cities = [
        ("San Francisco", "CA", True), ("New York", "NY", False), ("Seattle", "WA", True), 
        ("Austin", "TX", True), ("Boston", "MA", False), ("Chicago", "IL", False), 
        ("Los Angeles", "CA", False), ("Denver", "CO", True), ("Atlanta", "GA", False), 
        ("Washington", "DC", False), ("Dallas", "TX", True), ("San Jose", "CA", True),
        ("San Diego", "CA", False), ("Portland", "OR", True), ("Austin", "TX", True),
        ("Pittsburgh", "PA", False), ("Philadelphia", "PA", False), ("Miami", "FL", False),
        ("Phoenix", "AZ", False), ("Houston", "TX", False), ("Minneapolis", "MN", False),
        ("Detroit", "MI", False), ("Charlotte", "NC", False), ("Raleigh", "NC", True),
        ("Denver", "CO", True), ("Salt Lake City", "UT", True), ("Las Vegas", "NV", False),
        ("Nashville", "TN", False), ("Indianapolis", "IN", False), ("Columbus", "OH", False)
    ]
    
    locations = []
    for i, (city, state, remote_friendly) in enumerate(cities):
        locations.append({
            "id": i + 1,
            "city": city,
            "state": state,
            "country": "United States",
            "remote_friendly": remote_friendly
        })
    return pd.DataFrame(locations)

def generate_skills():
    # 200+ specific skills categorized
    categories = {
        "Languages": [
            "Python", "JavaScript", "SQL", "Java", "C++", "R", "Go", "TypeScript", "Scala", 
            "Kotlin", "Ruby", "Swift", "Rust", "PHP", "HTML", "CSS", "MATLAB", "Shell Scripting",
            "Perl", "Haskell", "Julia", "Dart", "Objective-C", "Lisp", "Fortran", "Cobol"
        ],
        "Data & Databases": [
            "PostgreSQL", "MongoDB", "MySQL", "Oracle", "Redis", "Elasticsearch", "Cassandra", 
            "SQLite", "Firebase", "SQL Server", "DynamoDB", "BigQuery", "Snowflake", "Redshift", 
            "Data Warehousing", "ETL", "NoSQL", "Graph Databases", "Hadoop", "Spark", "Hive", "Kafka",
            "MariaDB", "CouchDB", "Neo4j", "InfluxDB", "HBase", "Memcached", "CockroachDB"
        ],
        "Frameworks & Libraries": [
            "React", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Flask", "FastAPI",
            "Spring Boot", "Laravel", "ASP.NET", "Ruby on Rails", "jQuery", "Bootstrap", "Tailwind CSS",
            "Next.js", "Svelte", "Redux", "GraphQL", "Django REST Framework", "Tornado", "Sanic", "Gatsby"
        ],
        "AI & Machine Learning": [
            "TensorFlow", "PyTorch", "Scikit-Learn", "Keras", "NLP", "Computer Vision", 
            "Deep Learning", "Reinforcement Learning", "LLMs", "Generative AI", "Pandas", "NumPy",
            "Matplotlib", "Seaborn", "LangChain", "Hugging Face", "Vector Databases", "Prompt Engineering"
        ],
        "Cloud & DevOps": [
            "AWS", "Google Cloud", "Microsoft Azure", "Docker", "Kubernetes", "Terraform", "Ansible",
            "Jenkins", "GitLab CI", "GitHub Actions", "CI/CD", "Linux", "Nginx", "Apache", "Prometheus",
            "Grafana", "Cloudformation", "Serverless", "OpenStack", "Vagrant", "SaltStack", "Puppet"
        ],
        "BI & Analytics": [
            "Tableau", "Power BI", "Excel", "Looker", "SAS", "Google Analytics", "SPSS", 
            "Data Visualization", "A/B Testing", "Statistical Analysis", "Dashboard Design",
            "Predictive Modeling", "Quantitative Analysis"
        ],
        "Product & Business": [
            "Agile", "Scrum", "Jira", "Product Roadmapping", "User Research", "Market Analysis", 
            "Financial Modeling", "SEO", "Project Management", "Business Strategy", "CRM",
            "Risk Assessment", "Stakeholder Management"
        ],
        "Soft Skills": [
            "Communication", "Teamwork", "Problem Solving", "Critical Thinking", "Adaptability",
            "Leadership", "Time Management", "Collaboration", "Public Speaking", "Negotiation",
            "Emotional Intelligence", "Conflict Resolution", "Decision Making"
        ]
    }
    
    skills = []
    skill_id = 1
    for cat, list_skills in categories.items():
        for skill_name in list_skills:
            skills.append({
                "id": skill_id,
                "name": skill_name,
                "category": cat
            })
            skill_id += 1
            
    # Add filler skills to reach 200+
    filler_categories = ["Tools", "Security", "Methodologies"]
    fillers = [
        ("Security", "OAuth"), ("Security", "SAML"), ("Security", "SSL/TLS"), ("Security", "Penetration Testing"), 
        ("Security", "Cryptography"), ("Security", "SIEM"), ("Security", "Vulnerability Assessment"), 
        ("Tools", "Git"), ("Tools", "VS Code"), ("Tools", "Confluence"), ("Tools", "Slack"), ("Tools", "Trello"),
        ("Tools", "Figma"), ("Tools", "Adobe XD"), ("Tools", "Photoshop"), ("Tools", "Postman"),
        ("Methodologies", "DevSecOps"), ("Methodologies", "Microservices"), ("Methodologies", "REST APIs"),
        ("Methodologies", "SOAP"), ("Methodologies", "MVC Architecture"), ("Methodologies", "TDD"),
        ("Methodologies", "DDD"), ("Methodologies", "System Design"), ("Security", "IAM"),
        ("Security", "Firewalls"), ("Tools", "Websocket"), ("Tools", "Webpack"), ("Tools", "Babel"),
        ("Tools", "Vite"), ("Methodologies", "Agile Coaching"), ("Tools", "Salesforce"), ("Tools", "HubSpot"),
        ("Tools", "ZenDesk"), ("Methodologies", "KPI Tracking"), ("Methodologies", "SEO Optimization"),
        ("Methodologies", "Content Strategy"), ("Methodologies", "Copywriting"), ("Tools", "Google Ads"),
        ("Tools", "Meta Ads"), ("Tools", "Mailchimp"), ("Methodologies", "Growth Hacking"),
        ("Methodologies", "Supply Chain Management"), ("Tools", "SAP"), ("Tools", "Oracle ERP"),
        ("Tools", "SQL Developer"), ("Tools", "Jupyter Notebooks"), ("Tools", "Anaconda"),
        ("Methodologies", "Data Governance"), ("Methodologies", "Data Quality Control"),
        ("Tools", "QlikView"), ("Tools", "Alteryx"), ("Tools", "Talend"), ("Tools", "Airflow")
    ]
    
    for cat, name in fillers:
        skills.append({
            "id": skill_id,
            "name": name,
            "category": cat
        })
        skill_id += 1
        
    return pd.DataFrame(skills)

def generate_jobs(companies_df, locations_df, skills_df, num_jobs=51000):
    roles = {
        "Data Analyst": {
            "skills": ["SQL", "Python", "Excel", "Tableau", "Power BI", "Data Visualization", "Communication", "Problem Solving", "Pandas", "NumPy", "Statistical Analysis", "A/B Testing"],
            "base_salary": (60000, 115000),
            "industries": ["Finance", "Healthcare", "E-commerce", "Technology", "Retail"]
        },
        "Data Scientist": {
            "skills": ["Python", "R", "SQL", "Scikit-Learn", "PyTorch", "TensorFlow", "Pandas", "NumPy", "Deep Learning", "Statistical Analysis", "Communication", "BigQuery", "Spark"],
            "base_salary": (85000, 175000),
            "industries": ["Technology", "Finance", "Healthcare", "E-commerce", "Energy"]
        },
        "Business Analyst": {
            "skills": ["SQL", "Excel", "Power BI", "Tableau", "Agile", "Scrum", "Communication", "Project Management", "Business Strategy", "Stakeholder Management", "Jira"],
            "base_salary": (65000, 110000),
            "industries": ["Finance", "Retail", "Healthcare", "Technology", "Education"]
        },
        "Python Developer": {
            "skills": ["Python", "Django", "Flask", "FastAPI", "PostgreSQL", "Docker", "Git", "REST APIs", "AWS", "SQL", "Unit Testing", "Problem Solving"],
            "base_salary": (75000, 145000),
            "industries": ["Technology", "E-commerce", "Finance", "Entertainment"]
        },
        "AI Engineer": {
            "skills": ["Python", "PyTorch", "TensorFlow", "LLMs", "Generative AI", "LangChain", "Hugging Face", "Vector Databases", "Prompt Engineering", "Deep Learning", "Docker", "AWS", "System Design"],
            "base_salary": (110000, 220000),
            "industries": ["Technology", "Finance", "Healthcare", "Entertainment"]
        },
        "Full Stack Developer": {
            "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Express.js", "HTML", "CSS", "Tailwind CSS", "MongoDB", "PostgreSQL", "Git", "REST APIs", "Docker"],
            "base_salary": (75000, 150000),
            "industries": ["Technology", "E-commerce", "Entertainment", "Education"]
        },
        "DevOps Engineer": {
            "skills": ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins", "GitLab CI", "CI/CD", "Linux", "Bash", "Python", "Prometheus", "Grafana", "System Design"],
            "base_salary": (85000, 165000),
            "industries": ["Technology", "Finance", "E-commerce", "Telecommunications"]
        },
        "Data Engineer": {
            "skills": ["Python", "SQL", "Spark", "Kafka", "Airflow", "Hadoop", "PostgreSQL", "Snowflake", "AWS", "BigQuery", "ETL", "Data Warehousing", "Scala"],
            "base_salary": (90000, 170000),
            "industries": ["Technology", "Finance", "E-commerce", "Healthcare"]
        }
    }
    
    experience_levels = ["Entry-level", "Mid-level", "Senior-level"]
    job_types = ["Full-time", "Contract", "Remote", "Part-time"]
    
    # Pre-select IDs
    company_ids = companies_df["id"].tolist()
    company_industries = companies_df.set_index("id")["industry"].to_dict()
    location_ids = locations_df["id"].tolist()
    
    # Compile skill lists
    skill_records = skills_df.to_dict("records")
    skill_by_name = {s["name"]: s["id"] for s in skill_records}
    all_skill_names = list(skill_by_name.keys())
    
    jobs = []
    job_skills_mapping = []
    
    start_date = datetime(2025, 1, 1)  # Spanning 18 months from Jan 2025 onwards
    end_date = datetime(2026, 6, 17)
    delta_days = (end_date - start_date).days
    
    print(f"Generating {num_jobs} jobs...")
    
    # We will generate lists to append to avoid DataFrame overhead, then convert at the end
    job_id = 1
    for i in range(num_jobs):
        role_name = random.choice(list(roles.keys()))
        role_info = roles[role_name]
        
        comp_id = random.choice(company_ids)
        comp_industry = company_industries[comp_id]
        
        # 30% chance of matching location remote status
        loc_id = random.choice(location_ids)
        
        exp = random.choice(experience_levels)
        jtype = random.choice(job_types)
        
        # Calculate salaries based on role and experience multiplier
        base_min, base_max = role_info["base_salary"]
        if exp == "Entry-level":
            mult_min, mult_max = 0.8, 0.95
        elif exp == "Mid-level":
            mult_min, mult_max = 1.0, 1.25
        else: # Senior
            mult_min, mult_max = 1.3, 1.6
            
        sal_min = int(base_min * random.uniform(mult_min, mult_max) / 1000) * 1000
        sal_max = int(base_max * random.uniform(mult_min, mult_max) / 1000) * 1000
        
        # Ensure max >= min
        if sal_max < sal_min:
            sal_max = sal_min + random.randint(10, 40) * 1000
            
        post_days = random.randint(0, delta_days)
        post_date = start_date + timedelta(days=post_days)
        
        # Job Description (Simple realistic template)
        description = f"Seeking a skilled {exp} {role_name} to join our team in the {comp_industry} sector. The ideal candidate will be proficient in core technology methodologies and eager to build scalable solutions. Responsibilities include managing analytics dashboards, collaborating with stakeholders, and writing clean, maintainable code."
        
        jobs.append({
            "id": job_id,
            "title": role_name,
            "company_id": comp_id,
            "location_id": loc_id,
            "description": description,
            "salary_min": float(sal_min),
            "salary_max": float(sal_max),
            "experience_level": exp,
            "job_type": jtype,
            "posting_date": post_date.date(),
            "industry": comp_industry
        })
        
        # Skills for this job: Choose 4-8 from role skills + 1-2 random other skills (including soft skills)
        job_skills = list(role_info["skills"])
        selected_skills = random.sample(job_skills, min(len(job_skills), random.randint(4, 7)))
        
        # Add 1-2 random skills from the global list that are not in selected
        while len(selected_skills) < len(selected_skills) + random.randint(1, 2):
            s = random.choice(all_skill_names)
            if s not in selected_skills:
                selected_skills.append(s)
                break
                
        for sname in selected_skills:
            if sname in skill_by_name:
                job_skills_mapping.append({
                    "job_id": job_id,
                    "skill_id": skill_by_name[sname]
                })
                
        job_id += 1
        
        if i % 10000 == 0 and i > 0:
            print(f"Generated {i} records...")
            
    print(f"Generation complete. Created {len(jobs)} jobs and {len(job_skills_mapping)} skill mappings.")
    return pd.DataFrame(jobs), pd.DataFrame(job_skills_mapping)
