#!/usr/bin/env python
"""Run Flask development server for SDLC Framework UI"""

import os
import sys

# Set environment variables
os.environ['FLASK_APP'] = 'app.py'
os.environ['FLASK_ENV'] = 'development'

# Add current directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import and run Flask app
from app import app

if __name__ == '__main__':
    print("[INFO] Starting SDLC Framework Web UI...")
    print("[INFO] Access the app at: http://127.0.0.1:5000")
    print("[INFO] Press CTRL+C to stop the server")
    app.run(debug=True, port=5000, use_reloader=False)
