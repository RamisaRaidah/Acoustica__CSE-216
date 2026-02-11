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

activities = Blueprint("activities", __name__) 

@activities.get("/api/activities/health")
def health():
    return jsonify("activities")

@activities.post("/api/activities/email")
def send_email():
    return jsonify("send_email")

@activities.get("/api/activities/cheer")
def cheer():
    return jsonify("cheer")

@activities.delete("/api/assets/<asset_id>")
def ban_asset(asset_id):
    return jsonify(f"ban_asset {asset_id}")