from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def get_plans():
    return ("get_plans")

def subscribe():
    return ("subscribe")

def get_subscription_details(subscription_id):
    return (f"get_subscription_details {subscription_id}")

def delete_subscription(subscription_id):
    return (f"delete_subscription {subscription_id}")

def set_auto_renewal(subscription_id):
    return (f"set_auto_renewal {subscription_id}")
