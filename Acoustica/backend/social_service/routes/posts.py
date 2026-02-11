from flask import Blueprint, jsonify
import logging

from social_service.services import posts

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

posts_bp = Blueprint("posts", __name__) 

@posts_bp.get("/api/posts/health")
def health():
    return jsonify("posts")

@posts_bp.post("/api/reviews/<asset_id>")
def create_review_route(asset_id):
    return jsonify(f"create_review {asset_id}")

@posts_bp.get("/api/reviews/<asset_id>")
def get_reviews_route(asset_id):
    return jsonify(f"get_reviews {asset_id}")

@posts_bp.put("/api/reviews/<review_id>")
def edit_review_route(review_id):
    return jsonify(f"edit_reviews {review_id}")

@posts_bp.delete("/api/reviews/<review_id>")
def delete_review_route(review_id):
    return jsonify(f"delete_review {review_id}")

@posts_bp.post("/api/reports/<asset_id>")
def create_report_route(asset_id):
    return jsonify(f"create_report {asset_id}")

@posts_bp.get("/api/reports/<asset_id>")
def get_reports_route(asset_id):
    return jsonify(f"get_reports {asset_id}")

@posts_bp.patch("/api/reports/<report_id>")
def handle_user_report_route(report_id):
    return jsonify(f"handle_user_report {report_id}")

@posts_bp.post("/api/announcements")
def create_announcement_route():
    return jsonify("create_announcement")

@posts_bp.get("/api/announcements/<user_id>")
def get_announcements_route(user_id):
    return jsonify(f"get_announcements {user_id}")

@posts_bp.put("/api/announcements/<announcement_id>")
def edit_announcement_route(announcement_id):
    return jsonify(f"edit_announcement {announcement_id}")

@posts_bp.delete("/api/announcements/<announcement_id>")
def delete_announcement_route(announcement_id):
    return jsonify(f"delete_announcement {announcement_id}")

@posts_bp.post("/api/approval-requests")
def create_approval_requests_route():
    return jsonify("create_approval_requests")

@posts_bp.get("/api/approval-requests/<approval_request_id>")
def get_approval_requests_route(approval_request_id):
    return jsonify(f"get_approval_requests {approval_request_id}")

@posts_bp.patch("/api/approval-requests/<approval_request_id>")
def handle_approval_request_route(approval_request_id):
    return jsonify(f"handle_approval_request {approval_request_id}")
