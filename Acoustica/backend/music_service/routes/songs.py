from flask import Blueprint, json, jsonify, request
import logging
import sys
from flask_jwt_extended import jwt_required

from music_service.services import songs

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

songs_bp = Blueprint("songs", __name__) 

@songs_bp.get("/api/songs/health")
def health():
    return jsonify("Song is alive!!!")

### upload_song_route ###
@songs_bp.post("/api/music/songs")
@jwt_required()
def upload_song_route():
    title = request.form.get('song_title')
    album = request.form.get('album_id')
    collaborators = json.loads(request.form.get('collaborators'))
    language = request.form.get('language')
    genres = request.form.getlist('genres')
    moods = request.form.getlist('moods')
    instruments = request.form.getlist('instruments')
    release_date = request.form.get('release_date')
    song_file = request.files.get('song_audio')
    lyrics = request.files.get('lyrics')
    copyright_certificate = request.files.get('copyright_certificate')

    result, status = songs.upload_song(title, album, collaborators, language, genres, moods, instruments, release_date, song_file, lyrics, copyright_certificate)
    return jsonify(result), status

### get_song_details_route ###
@songs_bp.get("/api/music/songs/<song_id>")
@jwt_required()
def get_song_details_route(song_id):
    result, status = songs.get_song_details(song_id)
    return jsonify(result),status

@songs_bp.put("/api/music/songs/<song_id>")
@jwt_required()
def edit_song_route(song_id):
    return jsonify(f"edit_song {song_id}")

### delete_song_route ###
@songs_bp.delete("/api/music/songs/<song_id>")
@jwt_required()
def delete_song_route(song_id):
    result, status = songs.delete_song(song_id)
    return jsonify(result), status

@songs_bp.get("/api/music/songs/<song_id>/audio")
@jwt_required()
def get_song_audio_route(song_id):
    result, status = songs.get_song_audio(song_id)
    return jsonify(result), status