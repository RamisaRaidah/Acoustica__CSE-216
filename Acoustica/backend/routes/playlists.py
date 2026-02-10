from flask import Blueprint, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

playlists = Blueprint("playlists", __name__) 

@playlists.get("/playlists")
def health():
    return jsonify("playlists")

@playlists.post("/api/music/playlists")
def create_playlist():
    return jsonify("create_playlist")

@playlists.get("/api/music/playlists")
def get_playlists():
    return jsonify("get_playlists")

@playlists.delete("/api/music/playlists/<playlist_id>")
def delete_playlist(playlist_id):
    return jsonify(f"delete_playlist {playlist_id}")

@playlists.get("/api/music/playlists/<playlist_id>")
def get_playlist_details(playlist_id):
    return jsonify(f"get_playlist_details {playlist_id}")

@playlists.put("/api/music/playlists/<playlist_id>")
def edit_playlist(playlist_id):
    return jsonify(f"edit_playlists {playlist_id}")

@playlists.post("/api/music/playlists/<playlist_id>/songs/<song_id>")
def add_song_to_playlist(playlist_id,song_id):
    return jsonify(f"add_song_to_playlist {playlist_id} {song_id}")

@playlists.delete("/api/music/playlists/<playlist_id>/songs/<song_id>")
def remove_song_from_playlist(playlist_id,song_id):
    return jsonify(f"remove_song_from_playlist {playlist_id} {song_id}")

@playlists.patch("/api/music/playlists/<playlist_id>/visibility")
def set_playlist_visibility(playlist_id):
    return jsonify(f"set_playlist_visibility {playlist_id}")