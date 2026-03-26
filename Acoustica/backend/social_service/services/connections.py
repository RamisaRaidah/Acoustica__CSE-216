from db import execute_sql
import logging
import sys
from storage_service.services import storage
from flask_jwt_extended import get_jwt_identity

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def follow_artist(listener_id, artist_id):
    logging.info(f"Follow artist: {artist_id} by {listener_id}")
    existing = execute_sql(
        "SELECT 1 FROM followed_artist WHERE listener_id=%s AND artist_id=%s",
        (listener_id, artist_id), fetch_one=True
    )
    if existing:
        logging.info("About to unfollow")
        execute_sql(
            "DELETE FROM followed_artist WHERE listener_id=%s AND artist_id=%s",
            (listener_id, artist_id)
        )
        return {"message": "Unfollowed", 
                "is_following": False}, 200
    else:
        logging.info("About to follow")
        execute_sql(
            "INSERT INTO followed_artist (listener_id, artist_id) VALUES (%s, %s)",
            (listener_id, artist_id)
        )
        return {"message": "Followed", 
                "is_following": True}, 200
    
### check_follow_status ###
def check_follow_status(listener_id, artist_id):
    existing = execute_sql(
        "SELECT 1 FROM followed_artist WHERE listener_id=%s AND artist_id=%s",
        (listener_id, artist_id), fetch_one=True
    )
    if existing:
        return{"message": "Following",
               "is_following": True}, 200
    else:
        return {"message":"Not following",
                "is_following": False}, 200
    
### get_followed_artists ###
def get_followed_artists():
    command = """
        SELECT a.artist_id, a.stage_name artist_name, u.profile_picture 
        FROM followed_artist f JOIN artist a ON (f.artist_id = a.artist_id) JOIN users u ON (a.artist_id = u.user_id)
        WHERE listener_id = %s
    """

    result = execute_sql(command, (get_jwt_identity(),), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        for r in result:
            if r['profile_picture']:
                signed_url = storage.generate_signed_url(r['profile_picture'])
                if signed_url:
                    r['profile_picture'] = signed_url
                else:
                    r['profile_picture'] = "null"
            else:
                r['profile_picture'] = "null"

        return result, 200