from flask import Blueprint, jsonify
import logging

from music_service.services import albums

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

albums_bp = Blueprint("albums", __name__) 

@albums_bp.get("/api/albums/health")
def health():
    return jsonify("albums")

@albums_bp.post("/api/music/albums")
def create_album():
    return jsonify("create_album")

@albums_bp.get("/api/music/albums/<album_id>")
def get_album_details(album_id):
    return jsonify(f"get_album_details {album_id}")

@albums_bp.put("/api/music/albums/<album_id>")
def edit_album(album_id):
    return jsonify(f"edit_album {album_id}")

@albums_bp.delete("/api/music/albums/<album_id>")
def delete_album(album_id):
    return jsonify(f"delete_album {album_id}")

@albums_bp.post("/api/music/albums/<album_id>/songs/<song_id>")
def add_song_to_album(album_id,song_id):
    return jsonify(f"add_song_to_album {album_id} {song_id}")

@albums_bp.delete("/api/music/albums/<album_id>/songs/<song_id>")
def remove_song_from_album(album_id,song_id):
    return jsonify(f"remove_song_from_album {album_id} {song_id}")