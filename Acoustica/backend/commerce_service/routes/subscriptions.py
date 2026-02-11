from flask import Blueprint, jsonify
import logging

from commerce_service.services import subscriptions

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

subscriptions_bp = Blueprint("subscriptions", __name__) 

@subscriptions_bp.get("/api/subscriptions/health")
def health():
    return jsonify("subscriptions")

@subscriptions_bp.get("/api/subscriptions/plans")
def get_plans_route():
    return jsonify("get_plans")

@subscriptions_bp.post("/api/subscriptions/plans")
def subscribe_route():
    return jsonify("subscribe")

@subscriptions_bp.get("/api/subscriptions/<subscription_id>")
def get_subscription_details_route(subscription_id):
    return jsonify(f"get_subscription_details {subscription_id}")

@subscriptions_bp.delete("/api/subscriptions/<subscription_id>")
def delete_subscription_route(subscription_id):
    return jsonify(f"delete_subscription {subscription_id}")

@subscriptions_bp.patch("/api/subscriptions/<subscription_id>/auto-renewal")
def set_auto_renewal_route(subscription_id):
    return jsonify(f"set_auto_renewal {subscription_id}")
