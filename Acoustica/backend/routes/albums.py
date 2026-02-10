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

albums = Blueprint("albums", __name__) 

@albums.get("/albums")
def health():
    return jsonify("albums")

@albums.post("/api/music/albums")
def create_album():
    return jsonify("create_album")

@albums.get("/api/music/albums")
def get_albums():
    return jsonify("get_albums")

@albums.delete("/api/music/albums/<album_id>")
def delete_albums(album_id):
    return jsonify(f"delete_albums {album_id}")

@albums.get("/api/music/albums/<album_id>")
def get_album_details(album_id):
    return jsonify(f"get_album_details {album_id}")

@albums.put("/api/music/albums/<album_id>")
def edit_album(album_id):
    return jsonify(f"edit_albums {album_id}")

@albums.post("/api/music/albums/<album_id>/songs/<song_id>")
def add_song_to_album(album_id,song_id):
    return jsonify(f"add_song_to_album {album_id} {song_id}")

@albums.delete("/api/music/albums/<album_id>/songs/<song_id>")
def remove_song_from_album(album_id,song_id):
    return jsonify(f"remove_songs_from_album {album_id} {song_id}")