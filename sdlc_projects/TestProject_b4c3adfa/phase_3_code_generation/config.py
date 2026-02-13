'''
Configuration settings for the SDLC Framework
'''

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEBUG = os.getenv('DEBUG', False)
    TESTING = os.getenv('TESTING', False)
    PROJECT_NAME = os.getenv('PROJECT_NAME', 'Default Project')
    OUTPUT_DIR = os.getenv('OUTPUT_DIR', 'd:\\SDLC\\sdlc_projects')
    
    # LLM Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    MODEL_NAME = os.getenv('MODEL_NAME', 'gpt-4')
    
    # Database
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'sdlc_framework')
    
    # Cloud Deployment
    CLOUD_PROVIDER = os.getenv('CLOUD_PROVIDER', 'aws')
    CLOUD_REGION = os.getenv('CLOUD_REGION', 'us-east-1')
