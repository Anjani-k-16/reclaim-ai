# RECLAIM — Agentic Revenue Recovery & Intervention Engine

> **Razorpay 2026 Buildathon — Track 3 (AI Revenue Recovery)**  
> *Risk-Aware Expected-Value Revenue Recovery & Intervention Engine*

---

## 🏆 Project Pitch

When a transaction fails, traditional payment systems either retry blindly (incurring bank decline fees and annoying customers) or send generic reminders.

**RECLAIM** replaces blind retries with an **Expected-Value (EV) Intervention Loop**:
1. **Diagnosis Agent**: Classifies payment drop-off cause (Bank Timeout, Insufficient Balance, Abandoned Checkout, Subscription Mandate Lapse, Velocity Fraud).
2. **Probabilistic Recovery Model**: Trains a statistical classifier on 2,500 historical payment outcomes to estimate $P(\text{recovery} \mid \text{cause}, \text{context}, \text{action})$.
3. **Expected Monetary Value (EV) Engine**: Computes $\text{EV} = P(\text{recovery}) \times \text{Amount} - \text{Cost} - \text{FrictionPenalty}$ for each action (`RETRY`, `REMINDER`, `ESCALATE`, `STOP`).
4. **Merchant Policy Guardrails**: Enforces hard stopping rules (Max 3 retries limit, High-value threshold > ₹15,000 mandates human review, Risk score fraud halts).
5. **Razorpay Test Mode Executor**: Generates native Razorpay Payment Links and logs webhook audit trails.
6. **Explainability Control Room**: Provides complete "Why did RECLAIM choose this?" counterfactual decision trails for every transaction.

---

## 📐 Architecture Diagram

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
                                         │
                                         ▼
                         [ Measured Recovered Revenue (₹) ]
```

---

## 📊 Empirical Batch Evaluation Results (Held-Out 300-Case Batch)

| Metric | Result |
|---|---|
| **Total Revenue at Risk** | ₹24,85,500 |
| **Expected Revenue Recovered** | ₹10,88,648 |
| **Net Recovery Rate** | **43.8%** |
| **Auto-Retries Triggered (`RETRY`)** | 84 (28.0%) |
| **Razorpay Payment Links Sent (`REMINDER`)** | 128 (42.7%) |
| **Escalated to Human Ops (`ESCALATE`)** | 62 (20.7%) |
| **Halted by Security / Policy (`STOP`)** | 26 (8.6%) |
| **Guardrail Policy Overrides Applied** | 41 cases |

---

## ⚡ Razorpay Integration

RECLAIM integrates directly with **Razorpay Test Mode APIs** (`razorpay` Python SDK):
- **Payment Link Generation**: Triggered automatically when `REMINDER` action is chosen.
- **Webhook Audit Tracking**: Custom notes attached to Razorpay link payloads (`reclaim_txn_id`, `failure_reason`, `reclaim_reasoning`).

---

## 🚀 Quickstart Guide

### 1. Start FastAPI Backend (Port 8000)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Start React Vite Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
