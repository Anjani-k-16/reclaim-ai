import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd

from data_generator import generate_historical_data, generate_active_batch
from decision_engine import DecisionEngine
from razorpay_client import RazorpayRecoveryClient

app = FastAPI(
    title="RECLAIM API",
    description="Agentic Revenue Recovery & Intervention Engine for Razorpay Buildathon 2026",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class State:
    def __init__(self):
        self.decision_engine = DecisionEngine()
        self.razorpay_client = RazorpayRecoveryClient()
        self.batch: List[dict] = []
        self.evaluations: dict = {}
        self.executed_actions: dict = {}
        self.initialize()

    def initialize(self):
        print("Training RECLAIM Decision Engine on 2,500 historical transactions...")
        hist_df = generate_historical_data(n_samples=2500)
        self.decision_engine.train(hist_df)
        print("Engine training complete. Generating active 300-transaction at-risk batch...")
        self.batch = generate_active_batch(n_samples=300)
        self.evaluations = {}
        self.executed_actions = {}

state = State()

class CounterfactualRequest(BaseModel):
    amount: float
    failure_reason: str
    retry_count: int
    customer_segment: str = 'REGULAR'
    payment_method: str = 'UPI'
    issuing_bank: str = 'HDFC'
    historical_ltv: float = 15000.0
    risk_score: float = 0.15
    time_of_day: int = 14

class OverrideRequest(BaseModel):
    action: str
    notes: Optional[str] = "Human manager override"

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "app": "RECLAIM Revenue Recovery Engine",
        "track": "Razorpay Buildathon Track 3",
        "trained_engine": state.decision_engine.is_trained,
        "batch_size": len(state.batch)
    }

@app.post("/api/dataset/generate")
def reset_dataset(n_samples: int = 300):
    state.batch = generate_active_batch(n_samples=n_samples)
    state.evaluations = {}
    state.executed_actions = {}
    return {"status": "SUCCESS", "message": f"Generated {len(state.batch)} new at-risk transactions."}

@app.post("/api/engine/run-batch")
def run_batch_analysis():
    """
    Executes RECLAIM Decision Engine across all pending transactions in the batch.
    """
    processed = 0
    total_recovered_ev = 0.0

    for txn in state.batch:
        txn_id = txn['transaction_id']
        eval_result = state.decision_engine.evaluate_transaction(txn)
        state.evaluations[txn_id] = eval_result
        txn['status'] = 'ANALYZED'
        txn['recommended_action'] = eval_result['final_action']
        txn['guardrail_status'] = eval_result['guardrail_status']
        txn['expected_ev'] = eval_result['expected_recovered_amount']
        
        processed += 1
        total_recovered_ev += eval_result['expected_recovered_amount']

    return {
        "status": "SUCCESS",
        "processed_count": processed,
        "total_revenue_at_risk": sum(t['amount'] for t in state.batch),
        "total_expected_recovery": round(total_recovered_ev, 2),
        "recovery_rate_pct": round((total_recovered_ev / sum(t['amount'] for t in state.batch)) * 100, 1)
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    total_txns = len(state.batch)
    if total_txns == 0:
        return {}

    total_risk = sum(t['amount'] for t in state.batch)
    analyzed_txns = [t for t in state.batch if t['transaction_id'] in state.evaluations]
    
    total_recovered = sum(
        state.evaluations[t['transaction_id']]['expected_recovered_amount']
        for t in analyzed_txns
    ) if analyzed_txns else 0.0

    recovery_rate = (total_recovered / total_risk * 100) if total_risk > 0 else 0.0

    action_counts = {'RETRY': 0, 'REMINDER': 0, 'ESCALATE': 0, 'STOP': 0}
    guardrail_blocks = 0
    human_review_required = 0

    for t in analyzed_txns:
        eval_res = state.evaluations[t['transaction_id']]
        act = eval_res['final_action']
        action_counts[act] = action_counts.get(act, 0) + 1
        if eval_res['guardrail_status'] != 'PASSED':
            guardrail_blocks += 1
        if eval_res['requires_human_approval']:
            human_review_required += 1

    causes = {}
    for t in state.batch:
        c = t['failure_reason']
        causes[c] = causes.get(c, 0) + 1

    return {
        "total_transactions": total_txns,
        "analyzed_transactions": len(analyzed_txns),
        "total_revenue_at_risk": total_risk,
        "total_expected_recovery": round(total_recovered, 2),
        "recovery_rate_pct": round(recovery_rate, 1),
        "action_breakdown": action_counts,
        "guardrail_overrides": guardrail_blocks,
        "human_review_required": human_review_required,
        "cause_distribution": causes,
        "razorpay_executed_count": len(state.executed_actions)
    }

@app.get("/api/transactions")
def list_transactions(
    reason: Optional[str] = None,
    action: Optional[str] = None,
    guardrail: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    filtered = state.batch.copy()

    if reason:
        filtered = [t for t in filtered if t['failure_reason'] == reason]
    if action:
        filtered = [t for t in filtered if t.get('recommended_action') == action]
    if guardrail:
        filtered = [t for t in filtered if t.get('guardrail_status') == guardrail]
    if search:
        s = search.lower()
        filtered = [t for t in filtered if s in t['transaction_id'].lower() or s in t['customer_id'].lower() or s in t['customer_name'].lower()]

    start = (page - 1) * limit
    end = start + limit
    paginated = filtered[start:end]

    result_list = []
    for t in paginated:
        item = dict(t)
        if t['transaction_id'] in state.evaluations:
            item['evaluation'] = state.evaluations[t['transaction_id']]
        if t['transaction_id'] in state.executed_actions:
            item['execution'] = state.executed_actions[t['transaction_id']]
        result_list.append(item)

    return {
        "total": len(filtered),
        "page": page,
        "limit": limit,
        "transactions": result_list
    }

@app.get("/api/transactions/{txn_id}")
def get_transaction_detail(txn_id: str):
    txn = next((t for t in state.batch if t['transaction_id'] == txn_id), None)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    evaluation = state.evaluations.get(txn_id)
    if not evaluation:
        evaluation = state.decision_engine.evaluate_transaction(txn)
        state.evaluations[txn_id] = evaluation

    execution = state.executed_actions.get(txn_id)

    return {
        "transaction": txn,
        "evaluation": evaluation,
        "execution": execution
    }

@app.post("/api/transactions/{txn_id}/execute")
def execute_action(txn_id: str):
    txn = next((t for t in state.batch if t['transaction_id'] == txn_id), None)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    eval_res = state.evaluations.get(txn_id)
    if not eval_res:
        eval_res = state.decision_engine.evaluate_transaction(txn)
        state.evaluations[txn_id] = eval_res

    action = eval_res['final_action']
    execution_result = {}

    if action == 'REMINDER':
        payment_link = state.razorpay_client.create_payment_link(txn, eval_res['reasoning'])
        execution_result = {
            "action_executed": "REMINDER_PAYMENT_LINK",
            "razorpay_details": payment_link,
            "status": "EXECUTED",
            "message": f"Razorpay Payment Link generated successfully: {payment_link.get('short_url')}"
        }
    elif action == 'RETRY':
        execution_result = {
            "action_executed": "SMART_BACKGROUND_RETRY",
            "status": "EXECUTED",
            "retry_timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
            "message": f"Smart background retry scheduled with gateway {txn['issuing_bank']}."
        }
    elif action == 'ESCALATE':
        execution_result = {
            "action_executed": "ESCALATED_HUMAN_REVIEW",
            "status": "QUEUED_FOR_AGENT",
            "message": "Assigned to Merchant Support Ops dashboard for high-touch recovery."
        }
    else:
        execution_result = {
            "action_executed": "HALTED_NO_ACTION",
            "status": "STOPPED",
            "message": "Transaction halted to prevent customer friction or excessive decline fees."
        }

    state.executed_actions[txn_id] = execution_result
    txn['status'] = 'EXECUTED'
    return {"status": "SUCCESS", "execution": execution_result}

@app.post("/api/transactions/{txn_id}/override")
def override_action(txn_id: str, req: OverrideRequest):
    txn = next((t for t in state.batch if t['transaction_id'] == txn_id), None)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    eval_res = state.evaluations.get(txn_id)
    if not eval_res:
        eval_res = state.decision_engine.evaluate_transaction(txn)

    old_action = eval_res['final_action']
    eval_res['final_action'] = req.action
    eval_res['guardrail_status'] = 'HUMAN_OVERRIDDEN'
    eval_res['override_reason'] = f"Manager manual override from '{old_action}' to '{req.action}'. Note: {req.notes}"
    eval_res['requires_human_approval'] = False

    state.evaluations[txn_id] = eval_res
    txn['recommended_action'] = req.action
    txn['guardrail_status'] = 'HUMAN_OVERRIDDEN'
    return {"status": "SUCCESS", "updated_evaluation": eval_res}

@app.post("/api/simulator/evaluate")
def evaluate_counterfactual(req: CounterfactualRequest):
    txn_mock = {
        'transaction_id': 'sim_test_001',
        'amount': req.amount,
        'failure_reason': req.failure_reason,
        'retry_count': req.retry_count,
        'customer_segment': req.customer_segment,
        'payment_method': req.payment_method,
        'issuing_bank': req.issuing_bank,
        'historical_ltv': req.historical_ltv,
        'risk_score': req.risk_score,
        'time_of_day': req.time_of_day
    }

    eval_result = state.decision_engine.evaluate_transaction(txn_mock)
    return eval_result

if __name__ == '__main__':
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
