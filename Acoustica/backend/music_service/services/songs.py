from db import execute_sql
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def upload_song():
    return ("upload_song")

def get_song_details(song_id):
    command = "SELECT * FROM song WHERE song_id=%s"
    result = execute_sql(command, (1,), fetch_one=True)

    if not result:
        return {"error": "coudn't find song"}, 401
    
    return {""}

def edit_song(song_id):
    return (f"edit_song {song_id}")

def delete_song(song_id):
    return (f"delete_song {song_id}")

def get_song_audio(song_id):
    return (f"play_song {song_id}")

### Helper functions ###