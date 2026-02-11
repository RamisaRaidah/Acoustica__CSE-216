from flask import Blueprint, jsonify
import logging

from music_service.services import songs

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

songs_bp = Blueprint("songs", __name__) 

@songs_bp.get("/api/songs/health")
def health():
    return jsonify("songs")

@songs_bp.post("/api/music/songs")
def upload_song_route():
    return jsonify("upload_song")

@songs_bp.get("/api/music/songs/<song_id>")
def get_song_details_route(song_id):
    return jsonify(f"get_song_details {song_id}")

@songs_bp.put("/api/music/songs/<song_id>")
def edit_song_route(song_id):
    return jsonify(f"edit_song {song_id}")

@songs_bp.delete("/api/music/songs/<song_id>")
def delete_song_route(song_id):
    return jsonify(f"delete_song {song_id}")

@songs_bp.get("/api/music/songs/<song_id>/audio")
def play_song_route(song_id):
    return jsonify(f"play_song {song_id}")