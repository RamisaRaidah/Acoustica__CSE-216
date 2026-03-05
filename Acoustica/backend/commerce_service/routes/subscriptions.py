from flask import Blueprint, jsonify
import logging
import sys

from flask_jwt_extended import get_jwt_identity, jwt_required

from commerce_service.services import subscriptions

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

subscriptions_bp = Blueprint("subscriptions", __name__) 

@subscriptions_bp.get("/api/subscriptions/health")
def health():
    return jsonify("subscriptions")

@subscriptions_bp.get("/api/subscriptions/plans")
def get_plans_route():
    result, status=subscriptions.get_plans()
    return jsonify(result),status

@subscriptions_bp.post("/api/subscriptions")
@jwt_required()
def subscribe_route():
    user_id = get_jwt_identity()
    result, status = subscriptions.subscribe(user_id)
    return jsonify(result), status

@subscriptions_bp.get("/api/subscriptions-details")
@jwt_required()
def get_subscription_details_route():
    user_id = get_jwt_identity()
    result, status = subscriptions.get_subscription_details(user_id)
    return jsonify(result), status

@subscriptions_bp.delete("/api/subscriptions/<subscription_id>")
def delete_subscription_route(subscription_id):
    return jsonify(f"delete_subscription {subscription_id}")

@subscriptions_bp.patch("/api/subscriptions/<subscription_id>/auto-renewal")
def set_auto_renewal_route(subscription_id):
    return jsonify(f"set_auto_renewal {subscription_id}")
