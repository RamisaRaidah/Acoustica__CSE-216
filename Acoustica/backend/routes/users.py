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

users = Blueprint("users", __name__) 

@users.get("/users")
def health():
    return jsonify("users")

@users.put("/api/users/me")
def update_account():
    return jsonify("update_account")

@users.delete("/api/users/me")
def delete_account():
    return jsonify("delete_account")

@users.patch("/api/users/me/settings/app-mode")
def set_app_mode():
    return jsonify("set_app_mode")

@users.patch("/api/users/me/settings/play-mode")
def set_play_mode():
    return jsonify("set_play_mode")

@users.post("/api/users/<user_id>/notifications")
def add_notification(user_id):
    return jsonify(f"add_notification {user_id}")

@users.get("/api/users/me/notifications")
def get_notifications():
    return jsonify("get_notifications")

@users.post("/api/users/badges")
def add_badge():
    return jsonify("add_badge")

@users.get("/api/users/badges")
def get_badges():
    return jsonify("get_badges")

@users.post("/api/users/<user_id>/badges")
def add_user_badge(user_id):
    return jsonify(f"add_user_badge {user_id}")

@users.get("/api/users/<user_id>/badges")
def get_user_badges(user_id):
    return jsonify(f"get_user_badges {user_id}")

@users.get("/api/users")
def get_user_list():
    return jsonify("get_user_list")

@users.get("/api/users/<user_id>")
def get_user_account(user_id):
    return jsonify(f"get_user_account {user_id}")

@users.get("/api/users/<user_id>/profile")
def get_user_profile(user_id):
    return jsonify(f"get_user_profile {user_id}")