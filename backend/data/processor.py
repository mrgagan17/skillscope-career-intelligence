import time
import pandas as pd
import numpy as np
from sqlalchemy import text
from app.models import db, Company, Location, Skill, Job, job_skills
from data.generator import generate_companies, generate_locations, generate_skills, generate_jobs

def run_etl_pipeline(force=False):
    """
    Runs the full ETL pipeline:
    1. Extract: Generates realistic market data programmatically
    2. Transform: Cleans, filters duplicates, normalizes, and engineers salary midpoint features using Pandas
    3. Load: Ingests the data into SQLite using fast SQLAlchemy bulk operations
    """
    start_time = time.time()
    
    # 0. Check if data already exists to avoid redundant seeding
    try:
        if not force and db.session.query(Job).first() is not None:
            print("Database already populated. Skipping ETL seeding pipeline.")
            return True
    except Exception as e:
        print(f"Error checking existing database, proceeding with seeding: {e}")
    
    print("Starting SkillScope AI ETL & Data Seeding Pipeline...")
    
    # --- STEP 1: EXTRACT ---
    print("Extracting data (generating mock raw sets)...")
    companies_df = generate_companies()
    locations_df = generate_locations()
    skills_df = generate_skills()
    jobs_df, job_skills_df = generate_jobs(companies_df, locations_df, skills_df, num_jobs=50500)
    
    # --- STEP 2: TRANSFORM (Pandas Data Cleaning & Feature Engineering) ---
    print("Transforming and cleaning dataset using Pandas & NumPy...")
    
    # Clean duplicates & check missing values
    jobs_df = jobs_df.drop_duplicates(subset=['id'])
    
    # Handle missing values (if any)
    jobs_df['salary_min'] = jobs_df['salary_min'].fillna(0.0)
    jobs_df['salary_max'] = jobs_df['salary_max'].fillna(0.0)
    
    # Feature Engineering: Midpoint salary
    jobs_df['salary_midpoint'] = (jobs_df['salary_min'] + jobs_df['salary_max']) / 2
    
    # Normalize title and industry strings (stripping white spaces)
    jobs_df['title'] = jobs_df['title'].str.strip()
    jobs_df['industry'] = jobs_df['industry'].str.strip()
    
    # Validate datasets using assertions (Data Analyst validation style)
    assert not jobs_df.isnull().values.any(), "Cleaned jobs dataframe contains null values!"
    assert len(companies_df) >= 500, "Companies count is below expected benchmark."
    assert len(skills_df) >= 200, "Skills list is below expected benchmark."
    assert len(jobs_df) >= 50000, "Jobs database count is below expected 50,000+ benchmark."
    
    # Convert dates to string/ISO format for database injection
    jobs_df['posting_date'] = pd.to_datetime(jobs_df['posting_date']).dt.date
    
    # --- STEP 3: LOAD (Database Ingestion) ---
    print("Loading data into SQLite Database...")
    
    try:
        # Clear existing data if forced
        if force:
            print("Clearing existing tables...")
            db.session.execute(text("DELETE FROM job_skills"))
            db.session.execute(text("DELETE FROM jobs"))
            db.session.execute(text("DELETE FROM companies"))
            db.session.execute(text("DELETE FROM locations"))
            db.session.execute(text("DELETE FROM skills"))
            db.session.commit()
            
        # Ingest independent components
        print("Inserting Companies...")
        companies_records = companies_df.to_dict(orient='records')
        db.session.bulk_insert_mappings(Company, companies_records)
        
        print("Inserting Locations...")
        locations_records = locations_df.to_dict(orient='records')
        db.session.bulk_insert_mappings(Location, locations_records)
        
        print("Inserting Skills...")
        skills_records = skills_df.to_dict(orient='records')
        db.session.bulk_insert_mappings(Skill, skills_records)
        db.session.commit()
        
        # Ingest Jobs
        print("Inserting Jobs...")
        jobs_records = jobs_df.to_dict(orient='records')
        db.session.bulk_insert_mappings(Job, jobs_records)
        db.session.commit()
        
        # Ingest Job Skills linkages in chunked batches to prevent SQLite lock-ups
        print("Linking Job Skills (association table chunked load)...")
        linkages = job_skills_df.to_dict(orient='records')
        chunk_size = 20000
        for idx in range(0, len(linkages), chunk_size):
            chunk = linkages[idx : idx + chunk_size]
            db.session.execute(job_skills.insert(), chunk)
            db.session.commit()
        
        elapsed = time.time() - start_time
        print(f"ETL pipeline executed successfully in {elapsed:.2f} seconds.")
        print(f"Loaded: {len(companies_records)} companies, {len(locations_records)} locations, {len(skills_records)} skills, {len(jobs_records)} jobs, {len(linkages)} skills associations.")
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"ETL pipeline failed during database loading: {e}")
        return False
