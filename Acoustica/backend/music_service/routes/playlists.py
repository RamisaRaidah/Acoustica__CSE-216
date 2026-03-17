from flask import Blueprint, json, jsonify, request
import logging
import sys
from flask_jwt_extended import jwt_required

from music_service.services import playlists

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

playlists_bp = Blueprint("playlists", __name__) 

@playlists_bp.get("/api/playlists/health")
def health():
    return jsonify("playlists")

### create_playlist_route ###
@playlists_bp.post("/api/music/playlists")
@jwt_required()
def create_playlist_route():
    title = request.form.get('playlist_title')
    description = request.form.get('description')
    visibility = request.form.get('visibility')
    cover_picture = request.files.get('cover_picture')
    songs = json.loads(request.form.get('songs') or '[]')

    result, status = playlists.create_playlist(title, description, visibility, cover_picture, songs)
    return jsonify(result), status

### get_playlist_details_route ###
@playlists_bp.get("/api/music/playlists/<playlist_id>")
@jwt_required()
def get_playlist_details_route(playlist_id):
    result, status = playlists.get_playlist_details(playlist_id)
    return jsonify(result), status

@playlists_bp.put("/api/music/playlists/<playlist_id>")
@jwt_required()
def edit_playlist_route(playlist_id):
    return jsonify(f"edit_playlist {playlist_id}")

@playlists_bp.delete("/api/music/playlists/<playlist_id>")
@jwt_required()
def delete_playlist_route(playlist_id):
    return jsonify(f"delete_playlist {playlist_id}")

### get_playlist_songs_route ###
@playlists_bp.get("/api/music/playlists/<playlist_id>/songs")
@jwt_required()
def get_playlist_songs_route(playlist_id):
    result, status = playlists.get_playlist_songs(playlist_id)
    return jsonify(result), status

@playlists_bp.post("/api/music/playlists/<playlist_id>/songs/<song_id>")
@jwt_required()
def add_song_to_playlist_route(playlist_id,song_id):
    return jsonify(f"add_song_to_playlist {playlist_id} {song_id}")

@playlists_bp.delete("/api/music/playlists/<playlist_id>/songs/<song_id>")
@jwt_required()
def remove_song_from_playlist_route(playlist_id,song_id):
    return jsonify(f"remove_song_from_playlist {playlist_id} {song_id}")

@playlists_bp.patch("/api/music/playlists/<playlist_id>/visibility")
@jwt_required()
def set_playlist_visibility_route(playlist_id):
    return jsonify(f"set_playlist_visibility {playlist_id}")

### get_my_playlists_route ###
@playlists_bp.get("/api/music/playlists/me")
@jwt_required()
def get_my_playlists_route():
    result, status = playlists.get_my_playlists()
    return jsonify(result), status