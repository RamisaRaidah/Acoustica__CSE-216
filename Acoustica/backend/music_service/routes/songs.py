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
    genres = request.form.get('genres')
    moods = request.form.get('moods')
    instruments = request.form.get('instruments')
    release_date = request.form.get('release_date')
    song_file = request.files.get('song_audio')
    lyrics = request.files.get('lyrics')
    copyright_certificate = request.files.get('copyright_certificate')

    result, status = songs.upload_song(title, album, collaborators, language, genres, moods, instruments, release_date, song_file, lyrics, copyright_certificate)
    return jsonify(result), status

### get_song_metadata_route ###
@songs_bp.get("/api/music/songs/<song_id>/metadata")
@jwt_required()
def get_song_metadata_route(song_id):
    result, status = songs.get_song_metadata(song_id)
    return jsonify(result),status

### get_song_audio_route ###
@songs_bp.get("/api/music/songs/<song_id>/audio")
@jwt_required()
def get_song_audio_route(song_id):
    result, status = songs.get_song_audio(song_id)
    return jsonify(result), status

### get_song_lyrics_route ###
@songs_bp.get("/api/music/songs/<song_id>/lyrics")
@jwt_required()
def get_song_lyrics_route(song_id):
    result, status = songs.get_song_lyrics(song_id)
    return jsonify(result), status

### get_song_copyright_certificate_route ###
@songs_bp.get("/api/music/songs/<song_id>/copyright_certificate")
@jwt_required()
def get_song_copyright_certificate_route(song_id):
    result, status = songs.get_song_copyright_certificate(song_id)
    return jsonify(result), status

### get_song_collaborators_route ###
@songs_bp.get("/api/music/songs/<song_id>/collaborators")
@jwt_required()
def get_song_collaborators_route(song_id):
    result, status = songs.get_song_collaborators(song_id)
    return jsonify(result), status

### get_song_genres_route ###
@songs_bp.get("/api/music/songs/<song_id>/genres")
@jwt_required()
def get_song_genres_route(song_id):
    result, status = songs.get_song_genres(song_id)
    return jsonify(result), status

### get_song_moods_route ###
@songs_bp.get("/api/music/songs/<song_id>/moods")
@jwt_required()
def get_song_moods_route(song_id):
    result, status = songs.get_song_moods(song_id)
    return jsonify(result), status

### get_song_instruments_route ###
@songs_bp.get("/api/music/songs/<song_id>/instruments")
@jwt_required()
def get_song_instruments_route(song_id):
    result, status = songs.get_song_instruments(song_id)
    return jsonify(result), status

### edit_song_route ###
@songs_bp.put("/api/music/songs/<song_id>")
@jwt_required()
def edit_song_route(song_id):
    title = request.form.get('song_title')
    album = request.form.get('album_id')
    added_collaborators = json.loads(request.form.get('added_collaborators'))
    deleted_collaborators = json.loads(request.form.get('deleted_collaborators'))
    language = request.form.get('language')
    added_genres = json.loads(request.form.get('added_genres'))
    deleted_genres = json.loads(request.form.get('deleted_genres'))
    added_moods = json.loads(request.form.get('added_moods'))
    deleted_moods = json.loads(request.form.get('deleted_moods'))
    added_instruments = json.loads(request.form.get('added_instruments'))
    deleted_instruments = json.loads(request.form.get('deleted_instruments'))
    release_date = request.form.get('release_date')
    lyrics = request.files.get('lyrics')
    copyright_certificate = request.files.get('copyright_certificate')
    lyrics_action = request.form.get('lyrics_action')
    copyright_certificate_action = request.form.get('copyright_certificate_action')

    result, status = songs.edit_song(song_id, title, album, added_collaborators, deleted_collaborators, language, added_genres, deleted_genres, added_moods, deleted_moods, added_instruments, deleted_instruments, release_date, lyrics, copyright_certificate, lyrics_action, copyright_certificate_action)
    return jsonify(result), status

### delete_song_route ###
@songs_bp.delete("/api/music/songs/<song_id>")
@jwt_required()
def delete_song_route(song_id):
    result, status = songs.delete_song(song_id)
    return jsonify(result), status

### like_song_route ###
@songs_bp.put("/api/music/songs/<song_id>/like")
@jwt_required()
def like_song_route(song_id):
    result, status = songs.like_song(song_id)
    return jsonify(result), status