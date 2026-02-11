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

posts = Blueprint("posts", __name__) 

@posts.get("/api/posts/health")
def health():
    return jsonify("posts")

@posts.post("/api/reviews/<asset_id>")
def create_review(asset_id):
    return jsonify(f"create_review {asset_id}")

@posts.get("/api/reviews/<asset_id>")
def get_reviews(asset_id):
    return jsonify(f"get_reviews {asset_id}")

@posts.put("/api/reviews/<review_id>")
def edit_review(review_id):
    return jsonify(f"edit_reviews {review_id}")

@posts.delete("/api/reviews/<review_id>")
def delete_review(review_id):
    return jsonify(f"delete_review {review_id}")

@posts.post("/api/reports/<asset_id>")
def create_report(asset_id):
    return jsonify(f"create_report {asset_id}")

@posts.get("/api/reports/<asset_id>")
def get_reports(asset_id):
    return jsonify(f"get_reports {asset_id}")

@posts.patch("/api/reports/<report_id>")
def handle_user_report(report_id):
    return jsonify(f"handle_user_report {report_id}")

@posts.post("/api/announcements")
def create_announcement():
    return jsonify("create_announcement")

@posts.get("/api/announcements/<user_id>")
def get_announcements(user_id):
    return jsonify(f"get_announcements {user_id}")

@posts.put("/api/announcements/<announcement_id>")
def edit_announcement(announcement_id):
    return jsonify(f"edit_announcement {announcement_id}")

@posts.delete("/api/announcements/<announcement_id>")
def delete_announcement(announcement_id):
    return jsonify(f"delete_announcement {announcement_id}")

@posts.post("/api/approval-requests")
def create_approval_requests():
    return jsonify("create_approval_requests")

@posts.get("/api/approval-requests/<approval_request_id>")
def get_approval_requests(approval_request_id):
    return jsonify(f"get_approval_requests {approval_request_id}")

@posts.patch("/api/approval-requests/<approval_request_id>")
def handle_approval_request(approval_request_id):
    return jsonify(f"handle_approval_request {approval_request_id}")
