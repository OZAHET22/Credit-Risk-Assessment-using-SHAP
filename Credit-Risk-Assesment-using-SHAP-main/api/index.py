"""
Vercel Serverless Function entry point.
Exposes the FastAPI instance 'app' for the @vercel/python runtime.
"""
import sys
from pathlib import Path

# Resolve root directory
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import app

