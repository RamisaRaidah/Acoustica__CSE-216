from flask import Blueprint, jsonify
import logging

from user_service.services import listeners

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

listeners_bp = Blueprint("listeners", __name__) 

@listeners_bp.get("/api/listeners/health")
def health():
    return jsonify("listeners")

@listeners_bp.get("/api/listeners/me/dashboard")
def get_dashboard_route():
    return jsonify("get_dashboard")

@listeners_bp.get("/api/listeners/me")
def get_profile_route():
    return jsonify("get_profile")

@listeners_bp.get("/api/listeners/me/stream-history")
def get_stream_history_route():
    return jsonify("get_stream_history")

@listeners_bp.post("/api/listeners/me/liked-songs/<song_id>")
def add_liked_song_route(song_id):
    return jsonify(f"add_liked_song {song_id}")

@listeners_bp.get("/api/listeners/me/liked-songs")
def get_liked_songs_route():
    return jsonify("get_liked_songs")

@listeners_bp.post("/api/listeners/me/followed-artists/<artist_id>")
def add_followed_artist_route(artist_id):
    return jsonify(f"add_followed_artist {artist_id}")

@listeners_bp.get("/api/listeners/me/followed-artists")
def get_followed_artists_route():
    return jsonify("get_followed_artists")