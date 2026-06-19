from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Association table for Job and Skill
job_skills = db.Table('job_skills',
    db.Column('job_id', db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    target_role = db.Column(db.String(100), nullable=True)
    user_skills = db.Column(db.Text, nullable=True)  # Comma-separated list of skills
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    career_recommendations = db.relationship('CareerRecommendation', backref='user', cascade="all, delete-orphan", lazy=True)
    resume_analyses = db.relationship('ResumeAnalysis', backref='user', cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'target_role': self.target_role,
            'user_skills': self.user_skills.split(',') if self.user_skills else [],
            'created_at': self.created_at.isoformat()
        }

class Company(db.Model):
    __tablename__ = 'companies'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    industry = db.Column(db.String(100), nullable=True)
    size = db.Column(db.String(50), nullable=True)

    jobs = db.relationship('Job', backref='company', cascade="all, delete-orphan", lazy=True)

class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), default='United States')
    remote_friendly = db.Column(db.Boolean, default=False)

    jobs = db.relationship('Job', backref='location', cascade="all, delete-orphan", lazy=True)

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    category = db.Column(db.String(100), nullable=True)  # Programming, Cloud, Data, Soft, etc.

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False)
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id', ondelete='CASCADE'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    salary_min = db.Column(db.Float, nullable=True)
    salary_max = db.Column(db.Float, nullable=True)
    experience_level = db.Column(db.String(50), nullable=True)  # Entry, Mid, Senior
    job_type = db.Column(db.String(50), nullable=True)  # Full-time, Contract, Remote, Part-time
    posting_date = db.Column(db.Date, nullable=False)
    industry = db.Column(db.String(100), nullable=True)

    # Many-to-many relationship with Skill
    skills = db.relationship('Skill', secondary=job_skills, backref=db.backref('jobs', lazy='dynamic'))

class CareerRecommendation(db.Model):
    __tablename__ = 'career_recommendations'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    recommendation_text = db.Column(db.Text, nullable=False)  # Stored text or JSON
    roadmap = db.Column(db.Text, nullable=True)  # Roadmap steps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ResumeAnalysis(db.Model):
    __tablename__ = 'resume_analysis'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    filename = db.Column(db.String(200), nullable=False)
    raw_text = db.Column(db.Text, nullable=True)
    extracted_skills = db.Column(db.Text, nullable=True)  # Comma-separated list of skills
    match_score = db.Column(db.Float, default=0.0)
    recommendations = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
