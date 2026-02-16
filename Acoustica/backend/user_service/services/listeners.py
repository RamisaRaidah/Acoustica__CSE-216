from db import execute_sql
import logging
import sys

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

def get_dashboard():
    return ("get_dashboard")

def get_profile():
    return ("get_profile")

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