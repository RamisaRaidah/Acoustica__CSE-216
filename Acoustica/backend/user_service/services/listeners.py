from db import execute_sql
import logging
import sys
from flask_jwt_extended import get_jwt_identity

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def get_dashboard():
    return ("get_dashboard")

def get_profile():
    return ("get_profile")

# CREATE TABLE IF NOT EXISTS "song_stream_history" (
#   song_stream_id SERIAL CONSTRAINT pk_song_stream_history PRIMARY KEY,
#   listener_id INT CONSTRAINT fk_song_stream_history_listener_id REFERENCES listener(listener_id),
#   song_id INT CONSTRAINT fk_song_stream_history_song_id REFERENCES song(song_id),
#   date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#   "duration" INT
# );

### add_stream_history ###

def add_stream_history(segments):
    if not segments:
        return {"error": "no data"}, 400

    listener_id = get_jwt_identity()
    values = []
    placeholders = []

    for segment in segments:
        song_id = segment.get('song_id')
        datetime = segment.get('datetime')
        duration = int(segment.get('duration'))

        placeholders.append("(%s, %s, %s, %s)")
        values.extend([listener_id, song_id, datetime, duration])

    command = f"""
        INSERT INTO song_stream_history (listener_id, song_id, date_time, duration)
        VALUES {', '.join(placeholders)}
    """

    execute_sql(command, values)
    return {"message": "inserted"}, 200

def get_stream_history():
    return ("get_stream_history")

def add_liked_song(song_id):
    return (f"add_liked_song {song_id}")

def get_liked_songs():
    return ("get_liked_songs")

def add_followed_artist(artist_id):
    return (f"add_followed_artist {artist_id}")

def get_followed_artists():
    return ("get_followed_artists")

### Helper functions ###