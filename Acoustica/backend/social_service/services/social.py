from db import execute_sql
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def send_friend_request(user_id):
    return (f"send_friend_request {user_id}")

def get_friend_requests():
    return ("get_friend_requests")

def handle_friend_request(request_id):
    return (f"handle_friend_request {request_id}")

def get_friends():
    return ("get_friends")

def remove_friend(friend_id):
    return (f"remove_friend {friend_id}")

def create_family():
    return ("create_family")

def get_family_details(family_id):
    return (f"get_family_details {family_id}")    

def delete_family(family_id):
    return (f"delete_family {family_id}")

def add_family_member(family_id, member_id):
    return (f"add_family_member {family_id} {member_id}")

def remove_family_member(family_id, member_id):
    return (f"remove_family_member {family_id} {member_id}")

def share_to_friend(friend_id):
    return (f"share_to_friend {friend_id}")

def share_to_family(family_id):
    return (f"share_to_family {family_id}")

def get_friend_shared_contents():
    return ("get_friend_shared_contents")

def remove_friend_shared_content(friend_share_id):
    return (f"remove_friend_shared_content {friend_share_id}")

def get_family_shared_contents(family_id):
    return (f"get_family_shared_contents {family_id}")

def remove_family_shared_content(family_id, family_share_id):
    return (f"remove_family_shared_content {family_id} {family_share_id}")

### Helper functions ###