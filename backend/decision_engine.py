import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from data_generator import generate_historical_data, ACTIONS

ACTION_COSTS = {
    'RETRY': 2.0,
    'REMINDER': 1.0,
    'ESCALATE': 15.0,
    'STOP': 0.0
}

class DecisionEngine:
    def __init__(self):
        self.is_trained = False
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.feature_columns = []

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        df_encoded = pd.get_dummies(
            df[['failure_reason', 'customer_segment', 'payment_method', 'issuing_bank', 'action_taken']],
            drop_first=False
        )
        numerical = df[['amount', 'retry_count', 'time_of_day', 'historical_ltv', 'risk_score']]
        return pd.concat([numerical, df_encoded], axis=1)

    def train(self, historical_df: pd.DataFrame = None):
        if historical_df is None:
            historical_df = generate_historical_data(n_samples=2500)

        X = self.prepare_features(historical_df)
        y = historical_df['recovered']

        self.feature_columns = X.columns.tolist()
        self.model.fit(X, y)
        self.is_trained = True

    def predict_recovery_probabilities(self, txn: dict) -> dict:
        if not self.is_trained:
            self.train()

        probs = {}
        for action in ACTIONS:
            test_row = {
                'amount': txn['amount'],
                'retry_count': txn['retry_count'],
                'time_of_day': txn['time_of_day'],
                'historical_ltv': txn['historical_ltv'],
                'risk_score': txn['risk_score'],
                'failure_reason': txn['failure_reason'],
                'customer_segment': txn['customer_segment'],
                'payment_method': txn['payment_method'],
                'issuing_bank': txn['issuing_bank'],
                'action_taken': action
            }
            df_single = pd.DataFrame([test_row])
            X_single = pd.get_dummies(
                df_single[['failure_reason', 'customer_segment', 'payment_method', 'issuing_bank', 'action_taken']],
                drop_first=False
            )
            numerical = df_single[['amount', 'retry_count', 'time_of_day', 'historical_ltv', 'risk_score']]
            X_full = pd.concat([numerical, X_single], axis=1)

            for col in self.feature_columns:
                if col not in X_full.columns:
                    X_full[col] = 0
            X_full = X_full[self.feature_columns]

            if action == 'RETRY' and txn['failure_reason'] in ['CARD_EXPIRED', 'SUSPICIOUS_REPEATS']:
                p = 0.0
            elif action == 'STOP':
                p = 0.0
            else:
                p_raw = self.model.predict_proba(X_full)[0][1]
                p = round(float(p_raw), 4)

            probs[action] = p

        return probs

    def evaluate_transaction(self, txn: dict) -> dict:
        probs = self.predict_recovery_probabilities(txn)
        amount = txn['amount']
        retries = txn['retry_count']
        risk = txn['risk_score']

        ev_breakdown = {}
        for action in ACTIONS:
            p = probs[action]
            cost = ACTION_COSTS[action]
            penalty = (retries * 5.0) if action == 'RETRY' else 0.0
            expected_val = max(0.0, (p * amount) - cost - penalty)
            ev_breakdown[action] = {
                'p_recovery': p,
                'cost': cost,
                'penalty': penalty,
                'expected_value': round(expected_val, 2)
            }

        raw_best_action = max(ev_breakdown.keys(), key=lambda a: ev_breakdown[a]['expected_value'])

        guardrail_status = 'PASSED'
        override_reason = None
        final_action = raw_best_action
        requires_human_approval = False

        if raw_best_action == 'RETRY' and retries >= 3:
            guardrail_status = 'BLOCKED_MAX_RETRIES'
            override_reason = f"Max retries limit reached ({retries}/3). RETRY blocked by policy."
            remaining_actions = [a for a in ACTIONS if a != 'RETRY']
            final_action = max(remaining_actions, key=lambda a: ev_breakdown[a]['expected_value'])

        if amount >= 15000:
            requires_human_approval = True
            if guardrail_status == 'PASSED':
                guardrail_status = 'HIGH_VALUE_HUMAN_REVIEW'
                override_reason = f"Transaction amount (₹{amount:,.0f}) exceeds automatic execution threshold (₹15,000). Escalating for human review."

        if risk > 0.70 or txn['failure_reason'] == 'SUSPICIOUS_REPEATS':
            final_action = 'STOP' if risk > 0.85 else 'ESCALATE'
            guardrail_status = 'SECURITY_GUARDRAIL_OVERRIDE'
            override_reason = f"Elevated risk score ({risk}) or velocity concern. Automatic retry halted."
            requires_human_approval = True

        diagnosis = self.diagnose_cause(txn['failure_reason'], txn['issuing_bank'], txn['payment_method'])

        best_ev = ev_breakdown[final_action]['expected_value']
        best_p = probs[final_action]
        reasoning = (
            f"RECLAIM selected '{final_action}' (Expected Value: ₹{best_ev:,.2f}, P(recovery): {best_p:.0%}). "
            f"Diagnostic Root Cause: {diagnosis['summary']}. "
        )
        if override_reason:
            reasoning += f"Guardrail Alert: {override_reason}"

        return {
            'transaction_id': txn['transaction_id'],
            'diagnosis': diagnosis,
            'probabilities': probs,
            'ev_breakdown': ev_breakdown,
            'raw_recommended_action': raw_best_action,
            'final_action': final_action,
            'guardrail_status': guardrail_status,
            'override_reason': override_reason,
            'requires_human_approval': requires_human_approval,
            'expected_recovered_amount': best_ev if final_action != 'STOP' else 0.0,
            'reasoning': reasoning
        }

    def diagnose_cause(self, reason: str, bank: str, method: str) -> dict:
        mapping = {
            'INSUFFICIENT_FUNDS': {
                'summary': 'Temporary customer account balance constraint',
                'category': 'Financial Friction',
                'recommended_strategy': 'Payment Link Reminder or Scheduled Retry post-salary date'
            },
            'BANK_TIMEOUT': {
                'summary': f'Transient network gateway timeout with {bank}',
                'category': 'Technical / Gateway Interruption',
                'recommended_strategy': 'Immediate smart background retry'
            },
            'ABANDONED_CHECKOUT': {
                'summary': 'User dropped off during 2FA / OTP verification step',
                'category': 'Customer Abandonment',
                'recommended_strategy': 'Personalized payment link reminder via WhatsApp/SMS'
            },
            'SUBSCRIPTION_LAPSE': {
                'summary': 'Recurring mandate execution failed or expired card',
                'category': 'Mandate Failure',
                'recommended_strategy': 'Mandate update link or agent phone escalation'
            },
            'SUSPICIOUS_REPEATS': {
                'summary': 'High velocity repeat declines detected',
                'category': 'Risk / Velocity Concern',
                'recommended_strategy': 'Halt automated retries, mandate manual review'
            },
            'CARD_EXPIRED': {
                'summary': 'Payment card instrument expired',
                'category': 'Instrument Invalid',
                'recommended_strategy': 'Send card update request payment link'
            }
        }
        return mapping.get(reason, {
            'summary': 'Unknown payment drop-off cause',
            'category': 'General Decline',
            'recommended_strategy': 'Standard recovery flow'
        })
