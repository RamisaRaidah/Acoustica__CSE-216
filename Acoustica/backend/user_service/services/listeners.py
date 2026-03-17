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

### add_stream_history ###
def add_stream_history(segments):
    if not segments:
        return {"error": "no data"}, 400

    listener_id = get_jwt_identity()
    values = []
    placeholders = []
    played_songs = []

    for segment in segments:
        song_id = segment.get('song_id')
        datetime = segment.get('datetime')
        duration = int(segment.get('duration'))
        progress = float(segment.get('progress'))

        placeholders.append("(%s, %s, %s, %s, %s)")
        values.extend([listener_id, song_id, datetime, duration, progress])

        if duration >= 30:
            played_songs.append(song_id)

    command1 = f"""
        INSERT INTO song_stream_history (listener_id, song_id, date_time, duration, progress)
        VALUES {', '.join(placeholders)}
    """

    command2 = """
        UPDATE song 
        SET play_count = play_count + 1
        WHERE song_id IN %s
    """

    result = execute_sql(command1, values)

    if played_songs and result:
        execute_sql(command2, (tuple(played_songs),))

    return {"message": "inserted"}, 200

def get_stream_history():
    return ("get_stream_history")

### get_last_listening ###

def get_last_listening():
    command = """
        SELECT s.song_id, s.album_id, s.title, (first_name || ' ' || last_name) artist_name, progress
        FROM song_stream_history h JOIN song s ON (h.song_id = s.song_id) JOIN album a ON (s.album_id = a.album_id) JOIN users u ON (a.owner_id = u.user_id)
        ORDER BY song_stream_id DESC
        LIMIT 1
    """
    result = execute_sql(command, fetch_one = True)

    logging.info(result)
    
    if not result:
        return {
            "song_id": -1,
            "album_id": -1,
            "title": None,
            "artist_name": None,
            "progress": 0
        }, 200
    
    return result, 200

def add_liked_song(song_id):
    return (f"add_liked_song {song_id}")

def get_liked_songs():
    return ("get_liked_songs")

def add_followed_artist(artist_id):
    return (f"add_followed_artist {artist_id}")

def get_followed_artists():
    return ("get_followed_artists")

### Helper functions ###