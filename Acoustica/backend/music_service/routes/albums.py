from flask import Blueprint, jsonify, request
import logging
import sys

from music_service.services import albums


logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

albums_bp = Blueprint("albums", __name__) 

@albums_bp.get("/api/albums/health")
def health():
    return jsonify("album is alive!!!")

@albums_bp.post("/api/music/albums")
def create_album_route():
    title = request.form.get('album_title')
    description = request.form.get('description')
    release_date = request.form.get('release_date')
    cover_picture = request.files.get('cover_picture')
    copyright_certificate = request.files.get('copyright_certificate')

    result, status = albums.create_album(title, description, release_date, cover_picture, copyright_certificate)
    return jsonify(result), status

@albums_bp.get("/api/music/albums/<album_id>")
def get_album_details_route(album_id):
    return jsonify(f"get_album_details {album_id}")

@albums_bp.put("/api/music/albums/<album_id>")
def edit_album_route(album_id):
    return jsonify(f"edit_album {album_id}")

@albums_bp.delete("/api/music/albums/<album_id>")
def delete_album_route(album_id):
    return jsonify(f"delete_album {album_id}")

@albums_bp.post("/api/music/albums/<album_id>/songs/<song_id>")
def add_song_to_album_route(album_id,song_id):
    return jsonify(f"add_song_to_album {album_id} {song_id}")

@albums_bp.delete("/api/music/albums/<album_id>/songs/<song_id>")
def remove_song_from_album_route(album_id,song_id):
    return jsonify(f"remove_song_from_album {album_id} {song_id}")