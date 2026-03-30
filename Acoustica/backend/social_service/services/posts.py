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

def create_report(asset_id, listener_id, text, image=None):
    asset = execute_sql(
        "SELECT asset_id FROM asset WHERE asset_id = %s",
        (asset_id,), fetch_one=True
    )
    if not asset:
        return {"error": "Asset not found"}, 404

    report = execute_sql(
        """
        INSERT INTO report (author_id, asset_id, text, image)
        VALUES (%s, %s, %s, %s)
        RETURNING report_id, date_time
        """,
        (listener_id, asset_id, text, image), fetch_one=True
    )
    return {"message": "Report submitted", "report_id": report["report_id"]}, 201


def get_reports(asset_id):
    reports = execute_sql(
        """
        SELECT r.report_id, r.author_id, r.text, r.image, r.date_time,
               u.first_name, u.last_name, u.email
        FROM report r
        JOIN users u ON r.author_id = u.user_id
        WHERE r.asset_id = %s
        ORDER BY r.date_time DESC
        """,
        (asset_id,), fetch_all=True
    )
    return {"reports": reports}, 200

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