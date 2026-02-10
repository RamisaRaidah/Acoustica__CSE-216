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

social = Blueprint("social", __name__) 

@social.get("/social")
def health():
    return jsonify("social")

@social.post("/api/social/friends/requests/<user_id>")
def send_friend_request(user_id):
    return jsonify(f"send_friend_request {user_id}")

@social.get("/api/social/friends/requests/me")
def view_friend_requests():
    return jsonify("view_friend_requests")

@social.delete("/api/social/friends/requests/me/<request_id>")
def cancel_friend_request(request_id):
    return jsonify(f"cancel_friend_request {request_id}")

@social.patch("/api/social/friends/requests/<request_id>")
def accept_friend_request(request_id):
    return jsonify(f"accept_friend_request {request_id}")

@social.delete("/api/social/friends/requests/<request_id>")
def decline_friend_request(request_id):
    return jsonify(f"decline_friend_request {request_id}")

@social.delete("/api/social/friends/<friend_id>")
def remove_friend(friend_id):
    return jsonify(f"remove_friend {friend_id}")

@social.get("/api/social/friends/me")
def view_friends():
    return jsonify("view_friends")

@social.post("/api/social/families")
def create_family():
    return jsonify("create_family")

@social.delete("/api/social/families/<family_id>")
def delete_family(family_id):
    return jsonify(f"delete_family {family_id}")

@social.get("/api/social/families/<family_id>")
def view_family_details(family_id):
    return jsonify(f"view_family_details {family_id}")

@social.post("/api/social/families/<family_id>/members/<member_id>")
def add_family_member(family_id, member_id):
    return jsonify(f"add_family_member {family_id, member_id}")

@social.route("/api/social/families/<family_id>/members/<member_id>")
def remove_family_member(family_id, member_id):
    return jsonify(f"remove_family_member {family_id, member_id}")

@social.post("/api/social/friends/<friend_id>/shares")
def share_to_friend(friend_id):
    return jsonify(f"share_to_friend {friend_id}")

@social.post("/api/social/families/<family_id>/shares")
def share_to_family():
    return jsonify("share_to_family")

@social.get("/api/social/friends/me/shares")
def get_friend_shared_contents():
    return jsonify("get_friend_shared_contents")

@social.get("/api/social/families/<family_id>/shares")
def get_family_shared_contents():
    return jsonify("get_family_shared_contents")