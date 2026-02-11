from flask import Blueprint, jsonify
import logging

from commerce_service.services import transactions

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
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

