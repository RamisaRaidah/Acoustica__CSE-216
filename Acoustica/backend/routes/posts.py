from flask import Blueprint, render_template, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

posts = Blueprint("posts", __name__) 

@posts.route("/posts")
def posts_home():
    return jsonify("posts")

@posts.post("/api/reviews/<asset_id>")
def create_review(asset_id):
    return jsonify(f"create_review {asset_id}")

@posts.get("/api/reviews")
def get_reviews():
    return jsonify("get_reviews")

@posts.post("/api/reports/<asset_id>")
def create_report(asset_id):
    return jsonify(f"create_report {asset_id}")

@posts.get("/api/reports")
def get_reports():
    return jsonify("get_reports")

@posts.patch("/api/reports/<report_id>")
def handle_user_report(report_id):
    return jsonify(f"handle_user_report {report_id}")

@posts.post("/api/announcements")
def create_announcement():
    return jsonify("create_announcement")

@posts.get("/api/announcements")
def get_announcements():
    return jsonify("get_announcements")

@posts.delete("/api/announcements/<announcement_id>")
def remove_user_post(announcement_id):
    return jsonify(f"remove_user_post {announcement_id}")

@posts.post("/api/approval-requests")
def create_approval_requests():
    return jsonify("create_approval_requests")

@posts.get("/api/approval-requests")
def get_approval_requests():
    return jsonify("get_approval_requests")

@posts.patch("/api/approval-requests/<approval_request_id>")
def handle_approval_request(approval_request_id):
    return jsonify(f"handle_approval_request {approval_request_id}")
