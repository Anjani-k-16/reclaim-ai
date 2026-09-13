import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

FAILURE_REASONS = [
    'INSUFFICIENT_FUNDS',
    'BANK_TIMEOUT',
    'ABANDONED_CHECKOUT',
    'SUBSCRIPTION_LAPSE',
    'SUSPICIOUS_REPEATS',
    'CARD_EXPIRED'
]

CUSTOMER_SEGMENTS = ['NEW', 'REGULAR', 'VIP_HIGH_VALUE', 'SUBSCRIPTION']
PAYMENT_METHODS = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING']
ISSUING_BANKS = ['HDFC', 'ICICI', 'SBI', 'AXIS', 'PAYTM', 'OTHER']
ACTIONS = ['RETRY', 'REMINDER', 'ESCALATE', 'STOP']

def generate_historical_data(n_samples: int = 2000, seed: int = 42) -> pd.DataFrame:
    np.random.seed(seed)
    random.seed(seed)

    rows = []
    start_time = datetime.now() - timedelta(days=90)

    for i in range(n_samples):
        txn_id = f"hist_pay_{1000 + i}"
        cust_id = f"cust_{np.random.randint(100, 999)}"
        amount = float(np.random.choice([299, 499, 999, 1499, 2499, 4999, 8500, 12500, 18999, 35000], p=[0.15, 0.20, 0.20, 0.15, 0.10, 0.08, 0.05, 0.04, 0.02, 0.01]))
        failure_reason = np.random.choice(FAILURE_REASONS, p=[0.25, 0.30, 0.20, 0.12, 0.08, 0.05])
        segment = np.random.choice(CUSTOMER_SEGMENTS, p=[0.35, 0.40, 0.15, 0.10])
        payment_method = np.random.choice(PAYMENT_METHODS, p=[0.50, 0.25, 0.15, 0.10])
        bank = np.random.choice(ISSUING_BANKS, p=[0.30, 0.25, 0.20, 0.15, 0.05, 0.05])
        retry_count = np.random.randint(0, 5)
        time_of_day = np.random.randint(0, 24)
        historical_ltv = amount * np.random.uniform(1.5, 12.0)
        risk_score = round(float(np.random.beta(2, 5)), 2)

        action = np.random.choice(ACTIONS)

        base_p = 0.10
        if action == 'RETRY':
            if failure_reason == 'BANK_TIMEOUT':
                base_p = 0.78 - (retry_count * 0.12)
            elif failure_reason == 'INSUFFICIENT_FUNDS':
                base_p = 0.18 - (retry_count * 0.05)
            elif failure_reason == 'CARD_EXPIRED':
                base_p = 0.0
            elif failure_reason == 'SUSPICIOUS_REPEATS':
                base_p = 0.02
            else:
                base_p = 0.35 - (retry_count * 0.08)

        elif action == 'REMINDER':
            if failure_reason in ['ABANDONED_CHECKOUT', 'SUBSCRIPTION_LAPSE']:
                base_p = 0.65
            elif failure_reason == 'INSUFFICIENT_FUNDS':
                base_p = 0.38
            elif failure_reason == 'BANK_TIMEOUT':
                base_p = 0.42
            else:
                base_p = 0.20

        elif action == 'ESCALATE':
            if segment == 'VIP_HIGH_VALUE':
                base_p = 0.82
            elif amount > 15000:
                base_p = 0.72
            elif failure_reason in ['SUBSCRIPTION_LAPSE', 'CARD_EXPIRED']:
                base_p = 0.55
            else:
                base_p = 0.30

        elif action == 'STOP':
            base_p = 0.0

        base_p = max(0.0, min(0.95, base_p * (1.0 - (risk_score * 0.5))))
        success = 1 if np.random.rand() < base_p else 0

        rows.append({
            'transaction_id': txn_id,
            'customer_id': cust_id,
            'amount': amount,
            'failure_reason': failure_reason,
            'customer_segment': segment,
            'payment_method': payment_method,
            'issuing_bank': bank,
            'retry_count': retry_count,
            'time_of_day': time_of_day,
            'historical_ltv': round(historical_ltv, 2),
            'risk_score': risk_score,
            'action_taken': action,
            'recovered': success
        })

    return pd.DataFrame(rows)

def generate_active_batch(n_samples: int = 300, seed: int = 2026) -> list:
    np.random.seed(seed)
    random.seed(seed)

    batch = []
    now = datetime.now()

    for i in range(n_samples):
        txn_id = f"pay_atrisk_{1000 + i}"
        cust_id = f"cust_{np.random.randint(1000, 9999)}"
        amount = float(np.random.choice([499, 999, 1499, 2499, 4999, 7999, 12999, 18500, 29999], p=[0.20, 0.25, 0.18, 0.12, 0.10, 0.07, 0.04, 0.03, 0.01]))
        failure_reason = np.random.choice(FAILURE_REASONS, p=[0.26, 0.28, 0.22, 0.12, 0.07, 0.05])
        segment = np.random.choice(CUSTOMER_SEGMENTS, p=[0.35, 0.38, 0.17, 0.10])
        payment_method = np.random.choice(PAYMENT_METHODS, p=[0.48, 0.26, 0.16, 0.10])
        bank = np.random.choice(ISSUING_BANKS, p=[0.32, 0.24, 0.20, 0.14, 0.05, 0.05])
        retry_count = int(np.random.choice([0, 1, 2, 3, 4], p=[0.45, 0.30, 0.15, 0.07, 0.03]))
        time_of_day = int(np.random.randint(0, 24))
        historical_ltv = round(amount * float(np.random.uniform(2.0, 15.0)), 2)
        risk_score = round(float(np.random.beta(1.8, 5)), 2)
        created_at = (now - timedelta(minutes=int(np.random.randint(5, 1440)))).strftime("%Y-%m-%d %H:%M:%S")

        batch.append({
            'transaction_id': txn_id,
            'customer_id': cust_id,
            'customer_name': f"Customer #{cust_id.split('_')[1]}",
            'amount': amount,
            'failure_reason': failure_reason,
            'customer_segment': segment,
            'payment_method': payment_method,
            'issuing_bank': bank,
            'retry_count': retry_count,
            'time_of_day': time_of_day,
            'historical_ltv': historical_ltv,
            'risk_score': risk_score,
            'created_at': created_at,
            'status': 'PENDING_ANALYSIS'
        })

    return batch

if __name__ == '__main__':
    df = generate_historical_data()
    print(f"Generated {len(df)} historical training transactions.")
    batch = generate_active_batch()
    print(f"Generated {len(batch)} active at-risk transactions.")
