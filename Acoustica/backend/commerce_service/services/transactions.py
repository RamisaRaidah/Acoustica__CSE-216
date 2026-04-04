from db import execute_sql, get_db_connection, release_connection
from flask import request
import logging
import sys
import stripe
import os
from datetime import date, timedelta
from psycopg2.extras import RealDictCursor
from commerce_service.services import subscriptions

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def payment_transaction():
    return ("payment_transaction")

def get_transaction_details(transaction_id):
    return (f"get_transaction_details {transaction_id}")

def refund(transaction_id):
    return (f"refund {transaction_id}")

def create_payment_intent(user_id):
    data = request.get_json()
    plan_id = data.get("plan_id")
    auto_renewal = data.get("auto_renewal", "off")
    payment_method = "card"

    if not plan_id:
        return {"error": "plan_id is required"}, 400

    if auto_renewal not in ["on", "off"]:
        return {"error": "auto_renewal must be on or off"}, 400

    existing = execute_sql(
        """
        SELECT subscription_id 
        FROM plan_subscription
        WHERE owner_id = %s 
        AND end_date>=CURRENT_DATE 
        AND is_active=true  
        """,
        (user_id,), fetch_one=True
    )
    if existing:
        return {"error": "You already have an active subscription"}, 409

    plan = execute_sql(
        """SELECT plan_id, plan_type, plan_cost, plan_validity, max_members 
        FROM plan 
        WHERE plan_id = %s
        """,
        (plan_id,), fetch_one=True
    )
    if not plan:
        return {"error": "Invalid plan_id"}, 404


    amount_cents = int(float(plan["plan_cost"]) * 100)

    try:
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            metadata={
                "user_id": str(user_id),
                "plan_id": str(plan_id),
                "auto_renewal": auto_renewal,
                "payment_method": payment_method
            }
        )
        return {
            "client_secret": intent.client_secret,
            "publishable_key": os.environ.get("STRIPE_PUBLISHABLE_KEY"),
            "amount": float(plan["plan_cost"]),
            "plan_type": plan["plan_type"]
        }, 200

    except stripe.error.StripeError as e:
        logging.error(f"Stripe error: {e}")
        return {"error": str(e)}, 500


def handle_webhook(req):
    payload = req.get_data(as_text=True)
    sig_header = req.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError as e:
        logging.error(f"Webhook signature failed: {e}")
        return {"error": "Invalid signature"}, 400
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"error": str(e)}, 400

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        payment_intent_dict = payment_intent.to_dict()
        metadata = payment_intent_dict.get("metadata", {})

        user_id = int(metadata.get("user_id"))
        plan_id = int(metadata.get("plan_id"))
        auto_renewal = metadata.get("auto_renewal", "off")
        payment_method = metadata.get("payment_method", "card")
        amount = payment_intent["amount"] / 100

        subscriptions.subscribe(user_id, plan_id, auto_renewal, payment_method, amount)

    return {"status": "ok"}, 200






### Helper functions ###