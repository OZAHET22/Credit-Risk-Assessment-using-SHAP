# Explainable Credit Risk Assessment (FastAPI, XGBoost & SHAP)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOZAHET22%2FCredit-Risk-Assessment-using-SHAP)

An end-to-end, enterprise-grade Machine Learning web application for consumer credit default risk appraisal, featuring probability calibration, SHAP (SHapley Additive exPlanations) interpretability, and a fully responsive FinTech underwriting dashboard.

🔗 **GitHub Repository**: [https://github.com/OZAHET22/Credit-Risk-Assessment-using-SHAP](https://github.com/OZAHET22/Credit-Risk-Assessment-using-SHAP)

---

## 🌟 Key Capabilities & Architecture

1. **Machine Learning Core**:
   - **XGBoost Classifier (`XGBClassifier`)** trained on historical borrower default records.
   - **Data Preprocessing Pipeline**: Handling categorical one-hot encoding, numeric imputation, and feature engineering.
   - **Isotonic Probability Calibration**: `CalibratedClassifierCV` ensures predicted probabilities match real-world default frequencies.
   - **Cost-Optimized Cutoff Threshold**: Set at `~69.52%` based on precision-recall optimization.
   - **SHAP Interpretability**: Identifies dominant risk drivers (Debt-to-Income leverage, interest rate pricing, prior bureau defaults, income capacity).

2. **Backend & Serving Layer**:
   - **FastAPI**: Asynchronous REST API with Pydantic v2 schema validation.
   - **Multi-Environment Resilience**: Automatic fallback paths for local execution, containerized environments, and serverless runtimes.
   - **CORS & Monitoring**: Built-in `/health` endpoint and Swagger/OpenAPI documentation.

3. **Responsive Multi-Device Web Interface**:
   - **Desktops & Laptops (> 1024px)**: 2-column executive workspace with sticky real-time Decision Deck.
   - **Tablets (640px – 1024px)**: Dual-column inline form fields with fluid touch controls.
   - **Mobile Phones (<= 640px)**: 100% responsive single-column layout, virtual numeric keyboards (`inputmode="decimal"`), 48px touch targets, and smooth scroll to verdict.
   - **1-Click Demo Profiles**: Prime (Low Risk), Moderate (Near-Prime), and Subprime (High Risk).
   - **Print / PDF Underwriting Memo**: Dedicated `@media print` stylesheet for clean physical or PDF export.

---

## 📱 Multi-Device Support

| Device Class | Viewport | Layout Strategy |
| :--- | :--- | :--- |
| **Mobile Phones** | `320px` to `640px` | 1-column vertical flow, 48px touch targets, virtual numeric keyboard inputs, mobile-optimized gauge (scaled down), smooth scroll to verdict card. |
| **Tablets** | `641px` to `1024px` | 2-column field pairs inside section cards, full-width executive deck beneath, touch-friendly dropdowns. |
| **Desktops & Laptops** | `1025px+` | 2-column split grid (`1.25fr 0.95fr`) with sticky Live Decision Deck, real-time SVG circular gauge, physical stamp animation, and SHAP insight cards. |
| **Print / Export** | Physical / PDF | Custom `@media print` sheet stripping interactive UI, rendering clean black-and-white underwriting memorandum. |

---

## ⚡ Deployment to Vercel

This repository is configured for zero-config or 1-click deployment on **Vercel** via Serverless Python functions.

### Deploy Option A: Via Vercel Web Dashboard (GitHub)
1. Push this repository to **GitHub**.
2. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
3. Import your GitHub repository.
4. If your project files are inside the `Credit-Risk-Assesment-using-SHAP-main` directory, set the **Root Directory** to `Credit-Risk-Assesment-using-SHAP-main` (or leave as root, both include `vercel.json` and `api/index.py`).
5. Click **Deploy**. Vercel will automatically provision the `@vercel/python` runtime, install dependencies from `requirements.txt`, and deploy the static assets.

### Deploy Option B: Via Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Navigate to project directory
cd Credit-Risk-Assesment-using-SHAP-main

# Deploy to Vercel
vercel
```

---

## 💻 Local Running & Development

### 1. Prerequisites
- Python 3.10 or 3.11
- Virtual environment (`venv` or `uv`)

### 2. Environment Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Launch the Server
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

- **Web Dashboard**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 📡 REST API Reference

### `POST /predict`
Scores a loan application against the calibrated XGBoost model.

#### Request Body (`application/json`):
```json
{
  "person_age": 34,
  "person_income": 850000.0,
  "person_home_ownership": "OWN",
  "person_emp_length": 7.0,
  "loan_intent": "PERSONAL",
  "loan_grade": "A",
  "loan_amnt": 120000.0,
  "loan_int_rate": 8.2,
  "loan_percent_income": 0.14,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 9
}
```

#### Response (`200 OK`):
```json
{
  "default_probability": 0.01296,
  "default_prediction": 0,
  "threshold": 0.6952,
  "Result": "Low Risk",
  "risk_tier": "Prime (Very Low Risk)",
  "recommendation": "Instant Automated Approval",
  "margin_to_threshold_pct": -68.22,
  "dti_ratio": 0.14
}
```

---

## 📂 Project Structure

```text
├── api/
│   └── index.py                     # Vercel Serverless Function entry point
├── static/
│   ├── index.html                   # Responsive Underwriting Dashboard UI
│   ├── style.css                    # FinTech design system & multi-device CSS
│   └── script.js                    # Dynamic gauge, DTI tracker, presets & API client
├── credit_risk_model.pkl            # Calibrated XGBoost classification pipeline
├── best_threshold.pkl               # Persisted optimal decision cutoff (0.6952)
├── main.py                          # FastAPI backend application
├── requirements.txt                 # Pinned dependencies
├── runtime.txt                      # Python runtime version
├── vercel.json                      # Vercel serverless build & routing configuration
├── .vercelignore                    # Excludes datasets & caches from deployment bundle
├── render.yaml                      # Render PaaS deployment configuration
├── credit_risk_dataset.csv          # Training dataset
├── Credit_Risk.ipynb                # Data science exploration & training notebook
└── README.md                        # Documentation
```
