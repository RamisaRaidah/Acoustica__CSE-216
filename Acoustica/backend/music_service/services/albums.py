from db import execute_sql
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def create_album(title, description, release_date, cover_picture, copyright_certificate):
    if not title or not release_date or not copyright_certificate:
        return {"error": "missing required fields"}, 400
    # insert to db and cloud
    logging.info(title, description, release_date, cover_picture, copyright_certificate)
    return {"message": "album created successfully"}, 201

def get_album_details(album_id):
    return (f"get_album_details {album_id}")

def edit_album(album_id):
    return (f"edit_album {album_id}")

def delete_album(album_id):
    return (f"delete_album {album_id}")

def add_song_to_album(album_id,song_id):
    return (f"add_song_to_album {album_id} {song_id}")

def remove_song_from_album(album_id,song_id):
    return (f"remove_song_from_album {album_id} {song_id}")

### Helper functions ###