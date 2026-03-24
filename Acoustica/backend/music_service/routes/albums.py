from flask import Blueprint, jsonify, request
import logging
import sys
from flask_jwt_extended import jwt_required

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

### create_album_route ###
@albums_bp.post("/api/music/albums")
@jwt_required()
def create_album_route():
    title = request.form.get('album_title')
    description = request.form.get('description')
    release_date = request.form.get('release_date')
    cover_picture = request.files.get('cover_picture')
    copyright_certificate = request.files.get('copyright_certificate')
    visibility = request.form.get('visibility')

    result, status = albums.create_album(title, description, release_date, cover_picture, copyright_certificate, visibility)
    return jsonify(result), status

### get_albums_route ###
@albums_bp.get("/api/music/albums/all")
@jwt_required()
def get_albums_route():
    result, status = albums.get_albums()
    return jsonify(result), status

### get_album_details_route ###
@albums_bp.get("/api/music/albums/<album_id>")
@jwt_required()
def get_album_details_route(album_id):
    result, status = albums.get_album_details(album_id)
    return jsonify(result), status

### get_album_cover_picture_route ###
@albums_bp.get("/api/music/albums/<album_id>/cover-picture")
@jwt_required()
def get_album_cover_picture_route(album_id):
    result, status = albums.get_album_cover_picture(album_id)
    return jsonify(result), status

### get_my_albums_route ###
@albums_bp.get("/api/music/albums/me")
@jwt_required()
def get_my_albums_route():
    result, status = albums.get_my_albums()
    return jsonify(result), status

### get_album_songs_route ###
@albums_bp.get("/api/music/albums/<album_id>/songs")
@jwt_required()
def get_album_songs_route(album_id):
    result, status = albums.get_album_songs(album_id)
    return jsonify(result), status

### edit_album_route ###
@albums_bp.put("/api/music/albums/<album_id>")
@jwt_required()
def edit_album_route(album_id):
    title = request.form.get('album_title')
    description = request.form.get('description')
    release_date = request.form.get('release_date')
    cover_picture = request.files.get('cover_picture')
    copyright_certificate = request.files.get('copyright_certificate')
    visibility = request.form.get('visibility')
    cover_action = request.form.get('cover_action')
    copyright_certificate_action = request.form.get('copyright_certificate_action')

    result, status = albums.edit_album(album_id, title, description, release_date, cover_picture, copyright_certificate, visibility, cover_action, copyright_certificate_action)
    return jsonify(result), status

### delete_album_route ###
@albums_bp.delete("/api/music/albums/<album_id>")
@jwt_required()
def delete_album_route(album_id):
    result, status = albums.delete_album(album_id)
    return jsonify(result), status

@albums_bp.post("/api/music/albums/<album_id>/songs/<song_id>")
@jwt_required()
def add_song_to_album_route(album_id,song_id):
    return jsonify(f"add_song_to_album {album_id} {song_id}")

@albums_bp.delete("/api/music/albums/<album_id>/songs/<song_id>")
@jwt_required()
def remove_song_from_album_route(album_id,song_id):
    return jsonify(f"remove_song_from_album {album_id} {song_id}")

### like_album_route ###
@albums_bp.put("/api/music/albums/<album_id>/like")
@jwt_required()
def like_album_route(album_id):
    result, status = albums.like_album(album_id)
    return jsonify(result), status

### is_liked_route ###
@albums_bp.get("/api/music/albums/<album_id>/liked")
@jwt_required()
def is_liked_route(album_id):
    result, status = albums.is_liked(album_id)
    return jsonify(result), status