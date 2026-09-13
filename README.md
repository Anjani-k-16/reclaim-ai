# RECLAIM — Risk-Aware Expected-Value Revenue Recovery Engine

## Live Demo
https://reclaim-ai-agent.vercel.app

## Overview

When payment transactions fail, traditional systems rely on blind background retries or generic reminders. This approach incurs unnecessary gateway decline fees and creates customer friction.

**RECLAIM** replaces blind retries with an Expected-Value (EV) intervention loop:
1. **Diagnosis**: Classifies payment drop-off cause (Bank Timeout, Insufficient Funds, Abandoned Checkout, Subscription Mandate Lapse, Velocity Fraud).
2. **Probability Estimation**: Trains a statistical classifier on 2,500 historical payment outcomes to estimate P(recovery) for candidate actions.
3. **Expected Monetary Value (EV)**: Calculates net monetary return per intervention: EV = P(recovery) * Amount - Cost - Friction Penalty.
4. **Policy Guardrails**: Enforces merchant stopping rules (Max 3 retries limit, High-value threshold > ₹15,000 mandates human review, Risk score fraud halts).
5. **Razorpay Test Mode Execution**: Generates native Razorpay Payment Links with structured metadata notes.
6. **Auditability**: Provides a complete counterfactual decision trail for every transaction.

---

## Architecture Diagram

```
                       [ Batch of 300 At-Risk Transactions ]
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │    Diagnosis Engine   │
                             │ (Failure Categorizer) │
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │  Probabilistic ML /   │
                             │   Recovery Predictor  │
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │ Expected Value Engine │
                             │  & Counterfactuals    │
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │ Policy & Guardrails   │
                             │   (Stopping Rules)    │
                             └───────────┬───────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 ▼                       ▼                       ▼
      [ Automatic Retry ]      [ Razorpay Payment Link ]  [ Human Escalation / Stop ]
                 │                       │                       │
                 └───────────────────────┼───────────────────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │ Explainable Audit &   │
                             │ Recovery Dashboard    │
                             └───────────┬───────────┘
```

---

## Batch Evaluation Results (Held-Out 300-Case Batch)

| Metric | Measured Result |
|---|---|
| **Total Revenue at Risk** | **₹10,01,707** |
| **Expected Revenue Recovered** | **₹4,79,981.45** |
| **Net Recovery Efficiency Rate** | **47.9%** |
| **Auto Retries (`RETRY`)** | 45 (15.0%) |
| **Razorpay Payment Links (`REMINDER`)** | 153 (51.0%) |
| **Human Ops Escalations (`ESCALATE`)** | 102 (34.0%) |
| **Halted by Security (`STOP`)** | 0 (0.0%) |
| **Merchant Policy Guardrail Overrides** | **39 cases** |

---

## Quickstart Guide

### 1. Backend Setup (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
