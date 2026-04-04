from flask import json

from storage_service.services import storage
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


def create_report(asset_id, listener_id, text, image=None):
    asset = execute_sql(
        "SELECT asset_id FROM asset WHERE asset_id = %s",
        (asset_id,), fetch_one=True
    )
    if not asset:
        return {"error": "Asset not found"}, 404

    image_key = None
    if image:
        ext = storage.get_file_extension(image)
        if not ext:
            return {"error": "Invalid image file"}, 400

        image_key = f"Images/Reports/report_{asset_id}_{listener_id}.{ext}"
        success = storage.upload_file_to_storage(
            image.stream,
            image_key,
            image.mimetype
        )
        if not success:
            return {"error": "Failed to upload image"}, 500

    report = execute_sql(
        """
        INSERT INTO report (author_id, asset_id, text, image)
        VALUES (%s, %s, %s, %s)
        RETURNING report_id, date_time
        """,
        (listener_id, asset_id, text, image_key), fetch_one=True
    )
    return {
        "message": "Report submitted",
        "report_id": report["report_id"],
        "date_time": report["date_time"].isoformat()
    }, 201




def get_reports(asset_id):
    reports = execute_sql(
        """
        SELECT r.report_id,
               r.author_id,
               r.text,
               r.image,
               r.date_time,
               u.first_name,
               u.last_name,
               u.email
        FROM report r
        JOIN users u ON r.author_id = u.user_id
        WHERE r.asset_id = %s
        ORDER BY r.date_time DESC
        """,
        (asset_id,), fetch_all=True
    )

    for r in (reports or []):
        r["image"] = storage.generate_signed_url(r["image"]) if r["image"] else None

    return {"reports": reports or []}, 200


def handle_user_report(report_id, admin_id, action, note=None):
    if action not in ("dismiss", "remove_content"):
        return {"error": "action must be 'dismiss' or 'remove_content'"}, 400

    report = execute_sql(
        """
        SELECT report_id, asset_id, text, author_id, date_time, image
        FROM report
        WHERE report_id = %s
        """,
        (report_id,), fetch_one=True
    )
    if not report:
        return {"error": "Report not found"}, 404

    execute_sql(
        """
        INSERT INTO admin_activity_log (admin_id, activity_details)
        VALUES (%s, %s::jsonb)
        """,
        (
            admin_id,
            json.dumps({
                "activity":"report_handling",
                "verdict":action,
                "report_id":report["report_id"],
                "author_id":report["author_id"],
                "author_note":report["text"],
                "date_reported":report["date_time"].isoformat(),
                "asset_id":report["asset_id"],
                "admin_note":note,
            })
        )
    )

    if report["image"]:
        storage.delete_file_from_storage(report["image"])

    if action == "remove_content":
        execute_sql(
            "DELETE FROM asset WHERE asset_id = %s",
            (report["asset_id"],)
        )
        return {"message": "Content removed and report resolved", "report_id": report_id}, 200
    


    execute_sql("DELETE FROM report WHERE report_id = %s", (report_id,))
    return {"message": "Report dismissed", "report_id": report_id}, 200

def get_all_reports():
    reports = execute_sql(
        """
        SELECT
            r.report_id,
            r.author_id,
            r.text,
            r.image,
            r.date_time,
            r.asset_id,
            a.asset_type,
            u.first_name,
            u.last_name,
            u.email,
            u.profile_picture,

            CASE a.asset_type
                WHEN 'song'     THEN s.title
                WHEN 'album'    THEN al.title
                WHEN 'playlist' THEN pl.title
                WHEN 'product'  THEN p.product_name
                WHEN 'user'     THEN rep_u.first_name || ' ' || rep_u.last_name
            END AS content_title,

            CASE a.asset_type
                WHEN 'song'     THEN al_s.cover_picture
                WHEN 'album'    THEN al.cover_picture
                WHEN 'playlist' THEN pl.cover_picture
                WHEN 'product'  THEN p.product_image
                WHEN 'user'     THEN rep_u.profile_picture
            END AS cover_picture,

            CASE a.asset_type
                WHEN 'song'     THEN s.song_id
                WHEN 'album'    THEN al.album_id
                WHEN 'playlist' THEN pl.playlist_id
                WHEN 'product'  THEN p.product_id
                WHEN 'user'     THEN rep_u.user_id
            END AS typed_id

        FROM report r
        JOIN users u    ON u.user_id    = r.author_id
        JOIN asset a    ON a.asset_id   = r.asset_id

        LEFT JOIN song      s    ON a.asset_type = 'song'     AND s.asset_id    = a.asset_id
        LEFT JOIN album     al_s ON a.asset_type = 'song'     AND al_s.album_id = s.album_id
        LEFT JOIN album     al   ON a.asset_type = 'album'    AND al.asset_id   = a.asset_id
        LEFT JOIN playlist  pl   ON a.asset_type = 'playlist' AND pl.asset_id   = a.asset_id
        LEFT JOIN product   p    ON a.asset_type = 'product'  AND p.asset_id    = a.asset_id
        LEFT JOIN users     rep_u ON a.asset_type = 'user'    AND rep_u.asset_id = a.asset_id

        ORDER BY r.date_time DESC
        """,
        fetch_all=True
    )

    contents = []
    for r in (reports or []):
        contents.append({
            "report_id":     r["report_id"],
            "author_id":     r["author_id"],
            "first_name":    r["first_name"],
            "last_name":     r["last_name"],
            "email":         r["email"],
            "text":          r["text"],
            "image":         storage.generate_signed_url(r["image"]) if r["image"] else None,
            "date_time":     r["date_time"].isoformat(),
            "asset_id":      r["asset_id"],
            "asset_type":    r["asset_type"],
            "typed_id":      r["typed_id"],
            "content_title": r["content_title"],
            "cover_picture": storage.generate_signed_url(r["cover_picture"]) if r["cover_picture"] else None,
            "profile_pic": storage.generate_signed_url(r["profile_picture"])
        })

    return {"reports": contents}, 200


def get_all_activity_logs():
    logs = execute_sql(
        """
        SELECT
            al.activity_id,
            al.date_time,
            al.activity_details,
            u.first_name,
            u.last_name,
            u.email,
            u.profile_picture,
            a.role
        FROM admin_activity_log al
        JOIN admin a    ON a.admin_id = al.admin_id
        JOIN users u    ON u.user_id  = al.admin_id
        ORDER BY al.date_time DESC
        """,
        fetch_all=True
    )

    contents = []
    for log in (logs or []):
        details = log["activity_details"] or {}
        contents.append({
            "activity_id":      log["activity_id"],
            "date_time":        log["date_time"].isoformat(),
            "admin_first_name": log["first_name"],
            "admin_last_name":  log["last_name"],
            "admin_email":      log["email"],
            "admin_role":       log["role"],
            "admin_picture":    storage.generate_signed_url(log["profile_picture"]) if log["profile_picture"] else None,
            "activity":         details.get("activity"),
            "verdict":          details.get("verdict"),
            "report_id":        details.get("report_id"),
            "asset_id":         details.get("asset_id"),
            "author_id":        details.get("author_id"),
            "author_note":      details.get("author_note"),
            "date_reported":    details.get("date_reported"),
            "admin_note":       details.get("admin_note"),
        })

    return {"logs": contents}, 200


### Helper functions ###