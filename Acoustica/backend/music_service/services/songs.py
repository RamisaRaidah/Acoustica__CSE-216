from db import execute_sql
import logging

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

def upload_song():
    return ("upload_song")

def get_song_details(song_id):
    return (f"get_song_details {song_id}")

def edit_song(song_id):
    return (f"edit_song {song_id}")

def delete_song(song_id):
    return (f"delete_song {song_id}")

def play_song(song_id):
    return (f"play_song {song_id}")