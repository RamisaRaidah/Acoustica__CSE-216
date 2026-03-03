from flask import Blueprint, jsonify, request
import logging
import sys
from flask_jwt_extended import decode_token, jwt_required

from user_service.services import listeners

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

listeners_bp = Blueprint("listeners", __name__) 

@listeners_bp.get("/api/listeners/health")
def health():
    return jsonify("listeners")

@listeners_bp.get("/api/listeners/me/dashboard")
@jwt_required()
def get_dashboard_route():
    return jsonify("get_dashboard")

@listeners_bp.get("/api/listeners/me")
@jwt_required()
def get_profile_route():
    return jsonify("get_profile")

@listeners_bp.post("/api/listeners/me/stream-history")
@jwt_required()
def add_stream_history_route():
    segments = request.json
    logging.info(segments)
    result, status = listeners.add_stream_history(segments)
    return jsonify(result), status

@listeners_bp.get("/api/listeners/me/stream-history")
@jwt_required()
def get_stream_history_route():
    return jsonify("get_stream_history")

@listeners_bp.get("/api/listeners/me/last-listening")
@jwt_required()
def get_last_listening():
    result, status = listeners.get_last_listening()
    return jsonify(result), status

@listeners_bp.post("/api/listeners/me/liked-songs/<song_id>")
@jwt_required()
def add_liked_song_route(song_id):
    return jsonify(f"add_liked_song {song_id}")

@listeners_bp.get("/api/listeners/me/liked-songs")
@jwt_required()
def get_liked_songs_route():
    return jsonify("get_liked_songs")

@listeners_bp.post("/api/listeners/me/followed-artists/<artist_id>")
@jwt_required()
def add_followed_artist_route(artist_id):
    return jsonify(f"add_followed_artist {artist_id}")

@listeners_bp.get("/api/listeners/me/followed-artists")
@jwt_required()
def get_followed_artists_route():
    return jsonify("get_followed_artists")