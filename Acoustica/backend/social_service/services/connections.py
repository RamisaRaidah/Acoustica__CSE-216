from db import execute_sql
import logging
import sys

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
    

def checkFollowStatus(listener_id, artist_id):
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