from flask import Blueprint, jsonify, request
import logging
import sys

from flask_jwt_extended import get_jwt_identity, jwt_required

from social_service.services import social

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

social_bp = Blueprint("social", __name__) 

@social_bp.get("/api/social/health")
def health():
    return jsonify("social")

@social_bp.post("/api/social/friends/requests/<user_id>")
def send_friend_request_route(user_id):
    return jsonify(f"send_friend_request {user_id}")

@social_bp.get("/api/social/friends/requests/me")
def get_friend_requests_route():
    return jsonify("get_friend_requests")

@social_bp.patch("/api/social/friends/requests/<request_id>")
def handle_friend_request_route(request_id):
    return jsonify(f"handle_friend_request {request_id}")

@social_bp.get("/api/social/friends/me")
def get_friends_route():
    return jsonify("get_friends")

@social_bp.delete("/api/social/friends/<friend_id>")
def remove_friend_route(friend_id):
    return jsonify(f"remove_friend {friend_id}")

@social_bp.post("/api/social/families")
def create_family_route():
    return jsonify("create_family")

@social_bp.get("/api/social/families/<family_id>")
def get_family_details_route(family_id):
    return jsonify(f"get_family_details {family_id}")    

@social_bp.delete("/api/social/families/<family_id>")
def delete_family_route(family_id):
    return jsonify(f"delete_family {family_id}")

@social_bp.post("/api/social/families/<family_id>/members/<member_id>")
def add_family_member_route(family_id, member_id):
    return jsonify(f"add_family_member {family_id} {member_id}")

@social_bp.delete("/api/social/families/<family_id>/members/<member_id>")
def remove_family_member_route(family_id, member_id):
    return jsonify(f"remove_family_member {family_id} {member_id}")

@social_bp.post("/api/social/friends/<friend_id>/shares")
def share_to_friend_route(friend_id):
    return jsonify(f"share_to_friend {friend_id}")

@social_bp.post("/api/social/families/<int:family_id>/shares/<int:asset_id>")
@jwt_required()
def share_to_family_route(family_id, asset_id):
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    note = data.get("note")
    return social.share_to_family(family_id, asset_id, user_id, note)

@social_bp.get("/api/social/friends/me/shares")
def get_friend_shared_contents_route():
    return jsonify("get_friend_shared_contents")

@social_bp.delete("/api/social/friends/me/shares/<friend_share_id>")
def remove_friend_shared_content_route(friend_share_id):
    return jsonify(f"remove_friend_shared_content {friend_share_id}")

@social_bp.get("/api/social/families/<int:family_id>/shares")
@jwt_required()
def get_family_shared_contents_route(family_id):
    user_id=get_jwt_identity()
    return social.get_family_shared_contents(family_id,user_id)

@social_bp.delete("/api/social/families/<int:family_id>/shares/<int:family_shared_id>")
@jwt_required()
def delete_family_shared_content_route(family_id, family_shared_id):
    user_id = get_jwt_identity()
    return social.remove_family_shared_content(family_id, family_shared_id, user_id)

@social_bp.get("/api/social/families/me")
@jwt_required()
def get_user_family_route():
    user_id = get_jwt_identity()
    return social.get_user_family(user_id)
 