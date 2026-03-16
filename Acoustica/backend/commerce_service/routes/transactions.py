from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
import sys

from commerce_service.services import transactions

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

transactions_bp = Blueprint("transactions", __name__) 

@transactions_bp.get("/api/transactions/health")
def health():
    return jsonify("transactions")

@transactions_bp.post("/api/transactions/payment")
def payment_transaction_route():
    return jsonify("payment_transaction")

@transactions_bp.get("/api/transactions/<transaction_id>")
def get_transaction_details_route(transaction_id):
    return jsonify(f"get_transaction_details {transaction_id}")

@transactions_bp.post("/api/transactions/<transaction_id>/refund")
def refund_route(transaction_id):
    return jsonify(f"refund {transaction_id}")

@transactions_bp.post("/api/transactions/checkout/create-payment-intent")
@jwt_required()
def create_payment_intent_route():
    user_id = get_jwt_identity()
    result, status = transactions.create_payment_intent(user_id)
    return jsonify(result), status

@transactions_bp.post("/api/transactions/checkout/webhook")
def webhook_route():
    result, status = transactions.handle_webhook(request)
    return jsonify(result), status