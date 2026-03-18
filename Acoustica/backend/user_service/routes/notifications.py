from flask import Blueprint, Response, jsonify, request, stream_with_context
from flask_jwt_extended import jwt_required, get_jwt_identity, decode_token
from user_service.services import notifications
import json
import time
import logging

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.get("/api/notifications")
@jwt_required()
def get_notifications_route():
    user_id = get_jwt_identity()
    result = notifications.get_notifications(user_id)
    unread = notifications.get_unread_count(user_id)
    return jsonify({
        "notifications": result,
        "unread_count": unread
    }), 200

@notifications_bp.post("/api/notifications/mark-read")
@jwt_required()
def mark_read_route():
    user_id = get_jwt_identity()
    notifications.mark_all_read(user_id)
    return jsonify({"message": "Marked as read"}), 200

@notifications_bp.get("/api/notifications/stream")
def stream_route():
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "No token"}), 401
    
    try:
        decoded = decode_token(token)
        user_id = decoded["sub"]
    except Exception as e:
        logging.error(f"SSE token decode failed: {e}")
        return jsonify({"error": "Invalid token"}), 401

    def event_stream():
        while True:
            results = []
            unread = 0
            try:
                results = notifications.get_notifications(user_id)
                unread = notifications.get_unread_count(user_id)
            except Exception as e:
                logging.error(f"SSE stream error: {e}")
            
            data = json.dumps({
                "unread_count": unread,
                "notifications": results
            })
            yield f"data: {data}\n\n"
            time.sleep(5)

    return Response(
        stream_with_context(event_stream()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )