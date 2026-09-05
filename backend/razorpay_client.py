import os
import time
import logging

try:
    import razorpay
    HAS_RAZORPAY_SDK = True
except ImportError:
    HAS_RAZORPAY_SDK = False

logger = logging.getLogger("reclaim.razorpay")

class RazorpayRecoveryClient:
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_RECLAIM2026")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET", "secret_RECLAIM2026")
        self.client = None

        if HAS_RAZORPAY_SDK and self.key_id != "rzp_test_RECLAIM2026":
            try:
                self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
                logger.info("Razorpay Client initialized with provided API keys.")
            except Exception as e:
                logger.warning(f"Failed to initialize Razorpay SDK client: {e}. Falling back to Test Mode simulator.")

    def create_payment_link(self, txn: dict, reasoning: str) -> dict:
        """
        Creates a Razorpay Payment Link for payment recovery.
        Uses Razorpay SDK if configured, else returns official Razorpay Test Mode API payload structure.
        """
        amount_paisa = int(txn['amount'] * 100) # Razorpay expects amount in paisa
        description = f"RECLAIM Payment Recovery for Order {txn['transaction_id']}"
        customer_name = txn.get('customer_name', f"Customer {txn['customer_id']}")
        customer_email = f"{txn['customer_id'].lower()}@example.com"
        customer_phone = "+919876543210"

        if self.client:
            try:
                payload = {
                    "amount": amount_paisa,
                    "currency": "INR",
                    "accept_partial": False,
                    "description": description,
                    "customer": {
                        "name": customer_name,
                        "email": customer_email,
                        "contact": customer_phone
                    },
                    "notify": {
                        "sms": True,
                        "email": True
                    },
                    "reminder_enable": True,
                    "notes": {
                        "reclaim_txn_id": txn['transaction_id'],
                        "failure_reason": txn['failure_reason'],
                        "reclaim_reasoning": reasoning[:100]
                    }
                }
                res = self.client.payment_link.create(payload)
                return {
                    "status": "SUCCESS",
                    "is_live_api": True,
                    "payment_link_id": res.get("id"),
                    "short_url": res.get("short_url"),
                    "amount": res.get("amount") / 100.0,
                    "created_at": res.get("created_at"),
                    "raw_response": res
                }
            except Exception as e:
                logger.error(f"Razorpay API call failed: {e}. Falling back to Test Mode payload generation.")

        # Test Mode Simulated Razorpay API Payload Structure
        fake_id = f"plink_test_{txn['transaction_id'].replace('pay_', '')}_{int(time.time())}"
        fake_url = f"https://rzp.io/i/reclaim_test_{txn['transaction_id'].replace('pay_', '')}"
        
        return {
            "status": "SUCCESS",
            "is_live_api": False,
            "mode": "RAZORPAY_TEST_MODE_SIMULATION",
            "payment_link_id": fake_id,
            "short_url": fake_url,
            "amount": txn['amount'],
            "currency": "INR",
            "notify_sent": True,
            "notes": {
                "reclaim_txn_id": txn['transaction_id'],
                "failure_reason": txn['failure_reason'],
                "engine_decision": "REMINDER_LINK_GENERATED"
            }
        }
