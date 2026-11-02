from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
import pandas as pd
import joblib

BASE_DIR = Path(__file__).resolve().parent

ml_model = {}

def get_artifact_path(filename: str) -> Path:
    """Locate artifact across local, container, or Vercel serverless paths."""
    candidates = [
        BASE_DIR / filename,
        Path.cwd() / filename,
        BASE_DIR.parent / filename,
        BASE_DIR / "Credit-Risk-Assesment-using-SHAP-main" / filename,
        Path.cwd() / "Credit-Risk-Assesment-using-SHAP-main" / filename,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return BASE_DIR / filename

def load_artifacts():
    """Thread-safe lazy loader for model and threshold."""
    if "model" not in ml_model or "threshold" not in ml_model:
        model_path = get_artifact_path('credit_risk_model.pkl')
        threshold_path = get_artifact_path('best_threshold.pkl')

        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found at {model_path}")

        ml_model['model'] = joblib.load(model_path)
        ml_model['threshold'] = float(joblib.load(threshold_path))

    return ml_model['model'], ml_model['threshold']

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_artifacts()
    except Exception as e:
        print(f"[Warning] Lazy loading will be used: {e}")
    yield
    ml_model.clear()

app = FastAPI(
    title="Credit Risk Assessment & Underwriting API",
    description="Explainable loan default probability estimation powered by XGBoost, calibrated probabilities, and SHAP.",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Validated Pydantic schema for loan application
class LoanApplication(BaseModel):
    person_age: int = Field(..., ge=18, le=100, description="Applicant age in years")
    person_income: float = Field(..., ge=0, description="Annual income in currency units")
    person_home_ownership: str = Field(..., description="RENT, MORTGAGE, OWN, OTHER")
    person_emp_length: float = Field(..., ge=0, le=60, description="Employment duration in years")
    loan_intent: str = Field(..., description="PERSONAL, EDUCATION, MEDICAL, VENTURE, HOMEIMPROVEMENT, DEBTCONSOLIDATION")
    loan_grade: str = Field(..., description="A, B, C, D, E, F, G")
    loan_amnt: float = Field(..., gt=0, description="Requested principal amount")
    loan_int_rate: float = Field(..., ge=0, le=50, description="Annual interest rate percentage")
    loan_percent_income: float = Field(..., ge=0, le=1.5, description="Loan amount to annual income ratio")
    cb_person_default_on_file: str = Field(..., description="Historical default on record: Y or N")
    cb_person_cred_hist_length: int = Field(..., ge=0, le=60, description="Credit history vintage in years")

@app.get('/health')
def health():
    try:
        _, threshold = load_artifacts()
        return {
            "status": "healthy",
            "model_loaded": True,
            "threshold": threshold,
            "version": "2.0.0"
        }
    except Exception as exc:
        return {
            "status": "degraded",
            "model_loaded": False,
            "error": str(exc),
            "version": "2.0.0"
        }

@app.post('/predict')
def predict(data: LoanApplication):
    try:
        model, threshold = load_artifacts()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"ML Model unavailable: {exc}")

    payload = data.model_dump() if hasattr(data, "model_dump") else data.dict()
    input_df = pd.DataFrame([payload])

    try:
        raw_prob = model.predict_proba(input_df)[:, 1][0]
        probability = float(raw_prob)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {exc}")

    is_high_risk = bool(probability >= threshold)
    prediction = 1 if is_high_risk else 0
    margin = round((probability - threshold) * 100, 2)

    # Risk tiering
    if probability < 0.15:
        risk_tier = "Prime (Very Low Risk)"
        recommendation = "Instant Automated Approval"
    elif probability < threshold:
        risk_tier = "Near-Prime (Low Risk)"
        recommendation = "Standard Underwriting Approval"
    elif probability < 0.85:
        risk_tier = "Subprime (Elevated Risk)"
        recommendation = "Manual Credit Committee Review"
    else:
        risk_tier = "Distressed (High Default Risk)"
        recommendation = "Decline or Require Substantial Collateral"

    return {
        "default_probability": probability,
        "default_prediction": prediction,
        "threshold": threshold,
        "Result": "High Risk" if is_high_risk else "Low Risk",
        "risk_tier": risk_tier,
        "recommendation": recommendation,
        "margin_to_threshold_pct": margin,
        "dti_ratio": round(payload["loan_percent_income"], 4)
    }

# Mount static frontend
static_dirs = [
    BASE_DIR / "static",
    Path.cwd() / "static",
    BASE_DIR / "Credit-Risk-Assesment-using-SHAP-main" / "static",
    Path.cwd() / "Credit-Risk-Assesment-using-SHAP-main" / "static",
]
for s_dir in static_dirs:
    if s_dir.exists():
        app.mount("/", StaticFiles(directory=str(s_dir), html=True), name="static")
        break
