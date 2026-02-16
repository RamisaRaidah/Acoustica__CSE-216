from db import execute_sql
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def create_review(asset_id):
    return (f"create_review {asset_id}")

def get_reviews(asset_id):
    return (f"get_reviews {asset_id}")

def edit_review(review_id):
    return (f"edit_reviews {review_id}")

def delete_review(review_id):
    return (f"delete_review {review_id}")

def create_report(asset_id):
    return (f"create_report {asset_id}")

def get_reports(asset_id):
    return (f"get_reports {asset_id}")

def handle_user_report(report_id):
    return (f"handle_user_report {report_id}")

def create_announcement():
    return ("create_announcement")

def get_announcements(user_id):
    return (f"get_announcements {user_id}")

def edit_announcement(announcement_id):
    return (f"edit_announcement {announcement_id}")

def delete_announcement(announcement_id):
    return (f"delete_announcement {announcement_id}")

def create_approval_requests():
    return ("create_approval_requests")

def get_approval_requests(approval_request_id):
    return (f"get_approval_requests {approval_request_id}")

def handle_approval_request(approval_request_id):
    return (f"handle_approval_request {approval_request_id}")

### Helper functions ###