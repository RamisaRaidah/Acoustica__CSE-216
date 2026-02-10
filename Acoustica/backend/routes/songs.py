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

songs = Blueprint("songs", __name__) 

@songs.get("/songs")
def health():
    return jsonify("songs")

@songs.post("/api/music/songs")
def upload_song():
    return jsonify("upload_song")

@songs.get("/api/music/songs/<song_id>")
def get_song_details(song_id):
    return jsonify(f"get_song_details {song_id}")

@songs.put("/api/music/songs/<song_id>")
def edit_song(song_id):
    return jsonify(f"edit_song {song_id}")

@songs.delete("/api/music/songs/<song_id>")
def delete_song(song_id):
    return jsonify(f"delete_song {song_id}")

@songs.get("/api/music/songs/<song_id>/audio")
def play_song(song_id):
    return jsonify(f"play_song {song_id}")