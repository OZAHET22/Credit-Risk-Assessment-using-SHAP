(() => {
  "use strict";

  // Elements
  const form = document.getElementById("riskForm");
  const submitBtn = document.getElementById("submitBtn");
  const resetBtn = document.getElementById("resetBtn");
  const errorNote = document.getElementById("errorNote");

  const incomeInput = document.getElementById("person_income");
  const amountInput = document.getElementById("loan_amnt");
  const percentInput = document.getElementById("loan_percent_income");
  const dtiBadge = document.getElementById("dtiBadge");

  // Gauge & Readout
  const gaugeFill = document.getElementById("gaugeFill");
  const gaugeThreshold = document.getElementById("gaugeThreshold");
  const probNumber = document.getElementById("probNumber");
  const stampBadge = document.getElementById("stampBadge");
  const stampText = document.getElementById("stampText");
  const liveBadge = document.getElementById("liveBadge");

  // Ledger facts
  const factRiskTier = document.getElementById("factRiskTier");
  const factThreshold = document.getElementById("factThreshold");
  const factMargin = document.getElementById("factMargin");
  const factRecommendation = document.getElementById("factRecommendation");

  // Status & Deck Actions
  const apiDot = document.getElementById("apiDot");
  const apiStatusText = document.getElementById("apiStatusText");
  const copyJsonBtn = document.getElementById("copyJsonBtn");
  const printMemoBtn = document.getElementById("printMemoBtn");

  const GAUGE_CIRCUMFERENCE = 527.79; // 2 * PI * 84
  let lastResultData = null;

  // Preset Configurations calibrated against model distributions
  const PRESETS = {
    prime: {
      person_age: 34,
      person_income: 85000,
      person_home_ownership: "MORTGAGE",
      person_emp_length: 7.0,
      loan_intent: "PERSONAL",
      loan_grade: "A",
      loan_amnt: 8000,
      loan_int_rate: 7.5,
      cb_person_default_on_file: "N",
      cb_person_cred_hist_length: 9,
    },
    moderate: {
      person_age: 28,
      person_income: 42000,
      person_home_ownership: "RENT",
      person_emp_length: 3.0,
      loan_intent: "HOMEIMPROVEMENT",
      loan_grade: "C",
      loan_amnt: 12000,
      loan_int_rate: 10.0,
      cb_person_default_on_file: "N",
      cb_person_cred_hist_length: 4,
    },
    subprime: {
      person_age: 22,
      person_income: 24000,
      person_home_ownership: "RENT",
      person_emp_length: 1.0,
      loan_intent: "DEBTCONSOLIDATION",
      loan_grade: "E",
      loan_amnt: 16000,
      loan_int_rate: 18.5,
      cb_person_default_on_file: "Y",
      cb_person_cred_hist_length: 2,
    },
  };

  // ---------- Live DTI Leverage Ratio & Badge ----------
  function recalcDTI() {
    const income = parseFloat(incomeInput.value);
    const amount = parseFloat(amountInput.value);

    if (isNaN(income) || income <= 0) {
      dtiBadge.className = "dti-badge dti-badge--high";
      dtiBadge.textContent = "Zero / Invalid Income";
      percentInput.value = "1.00";
      return;
    }

    if (amount >= 0) {
      const ratio = Math.min(amount / income, 1.5);
      percentInput.value = ratio.toFixed(2);

      if (ratio < 0.2) {
        dtiBadge.className = "dti-badge dti-badge--safe";
        dtiBadge.textContent = `Safe Leverage (${(ratio * 100).toFixed(0)}%)`;
      } else if (ratio <= 0.4) {
        dtiBadge.className = "dti-badge dti-badge--mod";
        dtiBadge.textContent = `Moderate Leverage (${(ratio * 100).toFixed(0)}%)`;
      } else {
        dtiBadge.className = "dti-badge dti-badge--high";
        dtiBadge.textContent = `High Burden Warning (${(ratio * 100).toFixed(0)}%)`;
      }
    }
  }

  incomeInput.addEventListener("input", recalcDTI);
  amountInput.addEventListener("input", recalcDTI);
  percentInput.addEventListener("input", () => {
    const val = parseFloat(percentInput.value);
    if (!isNaN(val)) {
      if (val < 0.2) {
        dtiBadge.className = "dti-badge dti-badge--safe";
        dtiBadge.textContent = `Safe Leverage (${(val * 100).toFixed(0)}%)`;
      } else if (val <= 0.4) {
        dtiBadge.className = "dti-badge dti-badge--mod";
        dtiBadge.textContent = `Moderate Leverage (${(val * 100).toFixed(0)}%)`;
      } else {
        dtiBadge.className = "dti-badge dti-badge--high";
        dtiBadge.textContent = `High Burden Warning (${(val * 100).toFixed(0)}%)`;
      }
    }
  });

  // Initial Calculation
  recalcDTI();

  // ---------- Presets Loader ----------
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-preset");
      const config = PRESETS[key];
      if (!config) return;

      Object.entries(config).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) {
          el.value = val;
          el.dispatchEvent(new Event("change"));
        }
      });

      recalcDTI();
      clearError();

      // Auto trigger evaluation for instant demo feel
      form.dispatchEvent(new Event("submit"));
    });
  });

  // Reset Form
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      recalcDTI();
      clearError();
      resetVerdict();
    });
  }

  function resetVerdict() {
    gaugeFill.style.strokeDashoffset = GAUGE_CIRCUMFERENCE;
    probNumber.textContent = "--";
    stampBadge.className = "decision-stamp";
    stampText.textContent = "PENDING";
    liveBadge.textContent = "Ready to Score";
    liveBadge.className = "verdict-badge";
    factRiskTier.textContent = "Awaiting scoring";
    factMargin.textContent = "--";
    factRecommendation.textContent = "Submit dossier to compute";
    lastResultData = null;
  }

  // ---------- Service Health Check ----------
  async function checkHealth() {
    try {
      const res = await fetch("/health");
      if (res.ok) {
        const data = await res.json();
        apiDot.className = "status-dot ok";
        apiStatusText.textContent = "ML Engine Live & Connected";
        if (data.threshold) {
          factThreshold.textContent = `${(data.threshold * 100).toFixed(2)}%`;
        }
        return;
      }
      throw new Error();
    } catch (_) {
      // Fallback check
      fetch("/openapi.json")
        .then((r) => {
          if (r.ok) {
            apiDot.className = "status-dot ok";
            apiStatusText.textContent = "API Ready";
          } else {
            throw new Error();
          }
        })
        .catch(() => {
          apiDot.className = "status-dot down";
          apiStatusText.textContent = "Service Offline";
        });
    }
  }
  checkHealth();

  // ---------- Helpers ----------
  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("loading", isLoading);
    submitBtn.querySelector(".btn-label").textContent = isLoading
      ? "Scoring with XGBoost…"
      : "Assess Credit Risk";
  }

  function showError(msg) {
    errorNote.textContent = msg;
    errorNote.hidden = false;
  }

  function clearError() {
    errorNote.hidden = true;
    errorNote.textContent = "";
  }

  function animateCounter(el, startVal, endVal, duration) {
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      el.textContent = current.toFixed(1);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = endVal.toFixed(1);
      }
    }
    requestAnimationFrame(step);
  }

  // ---------- Verdict Rendering ----------
  function renderVerdict(data) {
    lastResultData = data;

    const probPct = data.default_probability * 100;
    const thresholdPct = (data.threshold || 0.6952) * 100;
    const isHighRisk = data.default_prediction === 1 || data.Result === "High Risk";

    // Update Status Badge
    liveBadge.textContent = isHighRisk ? "High Risk Alert" : "Approved Dossier";
    liveBadge.className = `verdict-badge ${isHighRisk ? "dti-badge--high" : "dti-badge--safe"}`;

    // Update Gauge Fill
    const offset = GAUGE_CIRCUMFERENCE * (1 - probPct / 100);
    gaugeFill.style.stroke = isHighRisk ? "url(#gaugeGradientRisk)" : "url(#gaugeGradientSafe)";
    requestAnimationFrame(() => {
      gaugeFill.style.strokeDashoffset = Math.max(0, offset);
    });

    // Update Threshold Needle Marker (3.6 deg per %)
    gaugeThreshold.style.transform = `rotate(${thresholdPct * 3.6}deg)`;

    // Readout Counter Animation
    const currentNum = parseFloat(probNumber.textContent) || 0;
    animateCounter(probNumber, currentNum, probPct, 900);

    // Decision Stamp
    stampBadge.className = "decision-stamp";
    void stampBadge.offsetWidth; // Force CSS reflow for animation restart

    if (isHighRisk) {
      stampBadge.classList.add("stamp--high-risk");
      stampText.textContent = "DECLINED";
    } else {
      stampBadge.classList.add("stamp--low-risk");
      stampText.textContent = "APPROVED";
    }

    // Ledger Facts
    factRiskTier.textContent = data.risk_tier || (isHighRisk ? "Subprime" : "Prime");
    factThreshold.textContent = `${thresholdPct.toFixed(2)}%`;

    const marginVal = data.margin_to_threshold_pct !== undefined
      ? data.margin_to_threshold_pct
      : ((data.threshold - data.default_probability) * 100).toFixed(2);

    factMargin.textContent = `${marginVal > 0 ? "+" : ""}${marginVal}% ${marginVal > 0 ? "Above Threshold" : "Clearance"}`;
    factMargin.style.color = isHighRisk ? "var(--danger)" : "var(--success)";

    factRecommendation.textContent = data.recommendation || (isHighRisk
      ? "Credit Committee Escalation Required"
      : "Approved for Standard Funding");

    // On mobile devices, smoothly scroll to verdict card
    if (window.innerWidth <= 1024) {
      const verdictEl = document.getElementById("verdictCard");
      if (verdictEl) {
        verdictEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function getCurrentPayload() {
    return {
      person_age: parseInt(document.getElementById("person_age").value, 10),
      person_income: parseFloat(incomeInput.value),
      person_home_ownership: document.getElementById("person_home_ownership").value,
      person_emp_length: parseFloat(document.getElementById("person_emp_length").value),
      loan_intent: document.getElementById("loan_intent").value,
      loan_grade: document.getElementById("loan_grade").value,
      loan_amnt: parseFloat(amountInput.value),
      loan_int_rate: parseFloat(document.getElementById("loan_int_rate").value),
      loan_percent_income: parseFloat(percentInput.value),
      cb_person_default_on_file: document.getElementById("cb_person_default_on_file").value,
      cb_person_cred_hist_length: parseInt(document.getElementById("cb_person_cred_hist_length").value, 10),
    };
  }

  // ---------- Form Submission ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    setLoading(true);

    const payload = getCurrentPayload();

    // Client-side validation check
    if (isNaN(payload.person_age) || payload.person_age < 18) {
      showError("Applicant age must be at least 18 years.");
      setLoading(false);
      return;
    }
    if (isNaN(payload.person_income) || payload.person_income < 0) {
      showError("Please specify a valid annual income.");
      setLoading(false);
      return;
    }
    if (isNaN(payload.loan_amnt) || payload.loan_amnt <= 0) {
      showError("Requested loan principal must be greater than zero.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail = body && body.detail ? JSON.stringify(body.detail) : `HTTP ${res.status}`;
        throw new Error(detail);
      }

      const data = await res.json();
      renderVerdict(data);
    } catch (err) {
      showError(`Underwriting service communication issue: ${err.message || "Please verify the service is running."}`);
    } finally {
      setLoading(false);
    }
  });

  // ---------- Copy JSON & Print Memo Actions ----------
  if (copyJsonBtn) {
    copyJsonBtn.addEventListener("click", () => {
      if (!lastResultData) {
        showError("Please evaluate an application first before copying the memorandum report.");
        return;
      }

      const report = {
        timestamp: new Date().toISOString(),
        engine: "XGBoost + CalibratedClassifierCV (v2.0.0)",
        underwriting_policy: "Cost-sensitive threshold at 69.52%",
        applicant_dossier: getCurrentPayload(),
        underwriting_decision: lastResultData,
      };

      navigator.clipboard.writeText(JSON.stringify(report, null, 2))
        .then(() => {
          const originalHTML = copyJsonBtn.innerHTML;
          copyJsonBtn.textContent = "Copied Memo!";
          setTimeout(() => {
            copyJsonBtn.innerHTML = originalHTML;
          }, 1800);
        })
        .catch(() => {
          showError("Unable to copy to clipboard.");
        });
    });
  }

  if (printMemoBtn) {
    printMemoBtn.addEventListener("click", () => {
      window.print();
    });
  }
})();
