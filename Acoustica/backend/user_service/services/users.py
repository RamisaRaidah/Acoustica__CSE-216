from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def update_account():
    return ("update_account")

def delete_account():
    return ("delete_account")

def get_user_list():
    return ("get_user_list")

def get_user_account(user_id):
    return (f"get_user_account {user_id}")

def get_user_profile(user_id):
    return (f"get_user_profile {user_id}")

def set_app_mode():
    return ("set_app_mode")

def set_play_mode():
    return ("set_play_mode")

def add_notification(user_id):
    return (f"add_notification {user_id}")

def get_notifications():
    return ("get_notifications")

def add_badge():
    return ("add_badge")

def get_badges():
    return ("get_badges")

def add_user_badge(user_id):
    return (f"add_user_badge {user_id}")

def get_user_badges(user_id):
    return (f"get_user_badges {user_id}")