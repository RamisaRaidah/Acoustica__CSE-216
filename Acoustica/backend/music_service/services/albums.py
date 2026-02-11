from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def create_album():
    return ("create_album")

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