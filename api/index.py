"""
Root Vercel Serverless Function entry point.
Routes to the inner project's FastAPI app.
"""
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
SUBDIR = ROOT_DIR / "Credit-Risk-Assesment-using-SHAP-main"

for candidate in [SUBDIR, ROOT_DIR]:
    if candidate.exists() and str(candidate) not in sys.path:
        sys.path.insert(0, str(candidate))

from main import app

