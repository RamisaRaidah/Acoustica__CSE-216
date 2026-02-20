from db import execute_sql
import logging
import sys

from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

### upload_song ###

def upload_song(file, title):
    if not file or not title:
        return {"error": "Missing file or title"}, 400
    
    s3_key = f"Songs/{title}.mp3"

    success = storage.upload_file_to_storage(
        file.stream,
        s3_key,
        file.mimetype
    )

    if success:
        return {"message": "song uploaded successfully"}, 200
    else:
        return {"error": "song upload failed"}, 500

def get_song_details(song_id):
    command = "SELECT * FROM song WHERE song_id=%s"
    result = execute_sql(command, (1,), fetch_one=True)

    if not result:
        return {"error": "coudn't find song"}, 401
    
    return {""}

def edit_song(song_id):
    return (f"edit_song {song_id}")

def delete_song(song_id):
    return (f"delete_song {song_id}")

def get_song_audio(song_id):
    command = "SELECT title FROM song WHERE song_id = %s"
    result = execute_sql(command, (song_id,), fetch_one = True)
    if not result:
        return {"error": "coudn't find song"}, 401
    path = "Songs/" + result['title'] + ".mp3"
    song_signed_url = storage.generate_signed_url(path)
    return {"stream_url": song_signed_url}, 200

### Helper functions ###