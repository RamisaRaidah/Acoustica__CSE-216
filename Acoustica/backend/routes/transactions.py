from flask import Blueprint, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

transactions = Blueprint("transactions", __name__) 

@transactions.get("/transactions")
def health():
    return jsonify("transactions")

@transactions.post("/api/transactions/payment")
def payment_transaction():
    return jsonify("payment_transaction")

@transactions.get("/api/transactions/me/history")
def get_transaction_history():
    return jsonify("get_transaction_history")

@transactions.get("/api/transactions/<transaction_id>")
def get_transaction_details(transaction_id):
    return jsonify(f"get_transaction_details {transaction_id}")

@transactions.post("/api/transactions/<transaction_id>/refund")
def refund(transaction_id):
    return jsonify(f"refund {transaction_id}")

