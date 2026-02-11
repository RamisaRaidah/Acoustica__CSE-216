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

subscriptions = Blueprint("subscriptions", __name__) 

@subscriptions.get("/api/subscriptions/health")
def health():
    return jsonify("subscriptions")

@subscriptions.get("/api/subscriptions/plans")
def get_plans():
    return jsonify("get_plans")

@subscriptions.post("/api/subscriptions/plans")
def subscribe():
    return jsonify("subscribe")

@subscriptions.get("/api/subscriptions/<subscription_id>")
def get_subscription_details(subscription_id):
    return jsonify(f"get_subscription_details {subscription_id}")

@subscriptions.delete("/api/subscriptions/<subscription_id>")
def delete_subscription(subscription_id):
    return jsonify(f"delete_subscription {subscription_id}")

@subscriptions.patch("/api/subscriptions/<subscription_id>/auto-renewal")
def set_auto_renewal(subscription_id):
    return jsonify(f"set_auto_renewal {subscription_id}")
