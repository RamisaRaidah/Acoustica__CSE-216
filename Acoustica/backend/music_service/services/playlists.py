from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def create_playlist():
    return ("create_playlist")

def get_playlist_details(playlist_id):
    return (f"get_playlist_details {playlist_id}")

def edit_playlist(playlist_id):
    return (f"edit_playlist {playlist_id}")

def delete_playlist(playlist_id):
    return (f"delete_playlist {playlist_id}")

def add_song_to_playlist(playlist_id,song_id):
    return (f"add_song_to_playlist {playlist_id} {song_id}")

def remove_song_from_playlist(playlist_id,song_id):
    return (f"remove_song_from_playlist {playlist_id} {song_id}")

def set_playlist_visibility(playlist_id):
    return (f"set_playlist_visibility {playlist_id}")