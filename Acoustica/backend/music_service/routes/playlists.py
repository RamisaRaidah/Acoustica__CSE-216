from flask import Blueprint, jsonify
import logging
import sys

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

@playlists_bp.post("/api/music/playlists")
def create_playlist_route():
    return jsonify("create_playlist")

@playlists_bp.get("/api/music/playlists/<playlist_id>")
def get_playlist_details_route(playlist_id):
    return jsonify(f"get_playlist_details {playlist_id}")

@playlists_bp.put("/api/music/playlists/<playlist_id>")
def edit_playlist_route(playlist_id):
    return jsonify(f"edit_playlist {playlist_id}")

@playlists_bp.delete("/api/music/playlists/<playlist_id>")
def delete_playlist_route(playlist_id):
    return jsonify(f"delete_playlist {playlist_id}")

@playlists_bp.post("/api/music/playlists/<playlist_id>/songs/<song_id>")
def add_song_to_playlist_route(playlist_id,song_id):
    return jsonify(f"add_song_to_playlist {playlist_id} {song_id}")

@playlists_bp.delete("/api/music/playlists/<playlist_id>/songs/<song_id>")
def remove_song_from_playlist_route(playlist_id,song_id):
    return jsonify(f"remove_song_from_playlist {playlist_id} {song_id}")

@playlists_bp.patch("/api/music/playlists/<playlist_id>/visibility")
def set_playlist_visibility_route(playlist_id):
    return jsonify(f"set_playlist_visibility {playlist_id}")