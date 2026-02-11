from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def payment_transaction():
    return ("payment_transaction")

def get_transaction_details(transaction_id):
    return (f"get_transaction_details {transaction_id}")

def refund(transaction_id):
    return (f"refund {transaction_id}")

