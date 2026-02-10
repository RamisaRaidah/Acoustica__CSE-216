from flask import Blueprint, render_template, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

listeners = Blueprint("listeners", __name__) 

@listeners.get("/listeners")
def health():
    return jsonify("listeners")

@listeners.get("/api/listeners/me/dashboard")
def get_dashboard():
    return jsonify("get_dashboard")

@listeners.get("/api/listeners/me")
def get_profile():
    return jsonify("get_profile")

@listeners.post("/api/listeners/me/liked-songs/<song_id>")
def add_liked_song(song_id):
    return jsonify(f"add_liked_song {song_id}")

@listeners.get("/api/listeners/me/liked-songs")
def get_liked_songs():
    return jsonify("get_liked_songs")

@listeners.get("/api/listeners/me/stream-history")
def get_stream_history():
    return jsonify("get_stream_history")

@listeners.post("/api/listeners/me/followed-artists/<artist_id>")
def add_followed_artist(artist_id):
    return jsonify(f"add_followed_artist {artist_id}")

@listeners.get("/api/listeners/me/followed-artists")
def get_followed_artists():
    return jsonify("get_followed_artists")