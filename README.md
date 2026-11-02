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

### 1-Click Instant Deploy
Click below to deploy directly to your Vercel account:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOZAHET22%2FCredit-Risk-Assessment-using-SHAP)

### Manual Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com/) &rarr; click **"Add New Project"**.
2. Select your repository: **`OZAHET22/Credit-Risk-Assessment-using-SHAP`**.
3. Click **Deploy**. Vercel will build and assign a production URL.

---

## 💻 Local Running & Development

```bash
# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate   # On Windows
# source .venv/bin/activate # On macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload --app-dir Credit-Risk-Assesment-using-SHAP-main
```

- **Web Dashboard**: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- **Swagger Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
