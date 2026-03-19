from db import get_db_connection, execute_sql, release_connection
from psycopg2.extras import RealDictCursor
import logging
import sys
from flask_jwt_extended import get_jwt_identity

from storage_service.services import storage

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

### create_playlist ###
def create_playlist(title, description, visibility, cover_picture, songs):
    if not title or not visibility:
        return {"error": "missing data"}, 500
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "couldn't connect to db"}, 500
    
    playlist_id = None
    cover_picture_ext = None
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT 1 FROM playlist 
                    WHERE LOWER(REPLACE(title, ' ', '')) = %s AND creator_id = %s
                """, (title.lower().replace(' ', ''), get_jwt_identity()))

                if cursor.fetchone():
                    return {"error": "exists"}, 400

                # Uploading to db
                cursor.execute("""
                    INSERT INTO playlist (title, creator_id, description, cover_picture, visibility)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING playlist_id
                    """, (title, get_jwt_identity(), description, None, visibility)
                )
                playlist_id = cursor.fetchone()["playlist_id"]

                if not playlist_id:
                    raise Exception()
                
                # Uploading to cloud
                if cover_picture:
                    cover_picture_ext = storage.get_file_extension(cover_picture)
                    cover_picture_path = f"Images/Cover_Pictures/playlist{playlist_id}.{cover_picture_ext}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        cover_picture_path,
                        cover_picture.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                # Updating table
                if cover_picture:
                    cursor.execute("""
                        UPDATE playlist
                        SET cover_picture = %s
                        WHERE playlist_id = %s
                        """, (f"Images/Cover_Pictures/playlist{playlist_id}.{cover_picture_ext}", playlist_id)
                    )

                # Uploading to playlist-song table

                if songs:
                    placeholders = []
                    values = []

                    for song in songs:
                        placeholders.append('(%s, %s)')
                        values.extend([playlist_id, song])

                    cursor.execute(f"""
                        INSERT INTO playlist_song (playlist_id, song_id)
                        VALUES {', '.join(placeholders)}
                        """, values
                    )

    except Exception as e:
        connection.rollback()
        if cover_picture:
            storage.delete_file_from_storage(f"Images/Cover_Pictures/playlist{playlist_id}.{cover_picture_ext}")
        return {"error": "failed"}, 500
    
    finally:
        release_connection(connection)
    
    return {"message": "successful"}, 201

### get_playlist_details ###
def get_playlist_details(playlist_id):
    command = """
        SELECT asset_id, title, description, creation_date, cover_picture, visibility, view_count 
        FROM playlist 
        WHERE playlist_id = %s
    """

    result = execute_sql(command, (playlist_id,), fetch_one = True)

    if result:
        return {'asset_id': result['asset_id'], 'title': result['title'], 'description': result['description'], 'creation_date': result['creation_date'], 'cover_picture_url': storage.generate_signed_url(result['cover_picture']), 'visibility': result['visibility'], 'view_count': result['view_count']}, 200
    else:
        return {"error": "Couldn't fetch data!"}, 500

### edit_playlist ###
def edit_playlist(playlist_id, title, description, visibility, cover_picture, added_songs, deleted_songs, cover_action):
    if not title or not visibility:
        return {"error": "missing data"}, 500
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "couldn't connect to db"}, 500
    
    cover_picture_ext = None
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT 1 FROM playlist 
                    WHERE LOWER(REPLACE(title, ' ', '')) = %s AND creator_id = %s
                """, (title.lower().replace(' ', ''), get_jwt_identity()))

                if cursor.fetchone():
                    return {"error": "exists"}, 400
                
                # Updating db                
                cursor.execute("""
                    UPDATE playlist 
                    SET title = %s, description = %s, visibility = %s
                    WHERE playlist_id = %s
                """, (title, description, visibility, playlist_id)
                )
                
                # Uploading to cloud
                if cover_action == 'replace' and cover_picture:
                    cursor.execute("SELECT cover_picture FROM playlist WHERE playlist_id = %s", (playlist_id,))
                    cp = cursor.fetchone()['cover_picture']
                    if cp:
                        storage.delete_file_from_storage(cp)

                    cover_picture_ext = storage.get_file_extension(cover_picture)
                    cover_picture_path = f"Images/Cover_Pictures/playlist{playlist_id}.{cover_picture_ext}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        cover_picture_path,
                        cover_picture.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                    cursor.execute("""
                        UPDATE playlist
                        SET cover_picture = %s
                        WHERE playlist_id = %s
                        """, (f"Images/Cover_Pictures/playlist{playlist_id}.{cover_picture_ext}", playlist_id)
                    )
                    
                elif cover_action == 'replace' and not cover_picture:
                    cursor.execute("SELECT cover_picture FROM playlist WHERE playlist_id = %s", (playlist_id,))
                    cp = cursor.fetchone()['cover_picture']
                    if cp:
                        storage.delete_file_from_storage(cp)

                    cursor.execute("""
                        UPDATE playlist
                        SET cover_picture = NULL
                        WHERE playlist_id = %s
                        """, (playlist_id,)
                    )
                    
                # Uploading to playlist-song table
                if added_songs:
                    placeholders = []
                    values = []

                    for song in added_songs:
                        placeholders.append('(%s, %s)')
                        values.extend([playlist_id, song])

                    cursor.execute(f"""
                        INSERT INTO playlist_song (playlist_id, song_id)
                        VALUES {', '.join(placeholders)}
                        """, values
                    )

                if deleted_songs:
                    placeholders = ', '.join(['%s'] * len(deleted_songs))
                    cursor.execute(
                        f"DELETE FROM playlist_song WHERE playlist_id = %s AND song_id IN ({placeholders})",
                        [playlist_id] + deleted_songs
                    )

    except Exception as e:
        connection.rollback()
        if cover_action == 'replace':
            storage.delete_file_from_storage(f"Images/Cover_Pictures/playlist{playlist_id}.{cover_picture_ext}")
        return {"error": "failed"}, 500
    
    finally:
        release_connection(connection)
    
    return {"message": "successful"}, 201

### delete_playlist ###
def delete_playlist(playlist_id):
    connection = get_db_connection()

    if connection is None:
        return {"error": "couldn't connect to db"}, 500
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT asset_id, cover_picture FROM playlist WHERE playlist_id = %s", (playlist_id,))
                
                result = cursor.fetchone()
                asset_id = result['asset_id']
                cover_picture = result['cover_picture']

                if not asset_id:
                    raise Exception()
                
                cursor.execute("DELETE FROM asset WHERE asset_id = %s", (asset_id,))

                if cover_picture:
                    storage.delete_file_from_storage(cover_picture)

    except Exception as e:
        connection.rollback()
        return {"error": "failed"}
    
    finally:
        release_connection(connection)

    return {"message": "successful"}, 201

### get_playlist_songs ###
def get_playlist_songs(playlist_id):
    command = """
        SELECT s.song_id, s.album_id, s.title, a.title album_name, (u.first_name || ' ' || u.last_name) artist_name, s.length
        FROM playlist_song p JOIN song s ON (p.song_id = s.song_id) JOIN album a ON (s.album_id = a.album_id) JOIN users u ON (a.owner_id = u.user_id)
        WHERE playlist_id = %s
    """

    result = execute_sql(command, (playlist_id,), fetch_all = True)

    if result is not None:
        return result, 200
    else:
        return {"error": "Couldn't load data!"}, 500

def add_song_to_playlist(playlist_id,song_id):
    return (f"add_song_to_playlist {playlist_id} {song_id}")

def remove_song_from_playlist(playlist_id,song_id):
    return (f"remove_song_from_playlist {playlist_id} {song_id}")

def set_playlist_visibility(playlist_id):
    return (f"set_playlist_visibility {playlist_id}")

### get_my_playlists ###

def get_my_playlists():
    command = """
        SELECT playlist_id, title, cover_picture
        FROM playlist 
        WHERE creator_id = %s
    """

    result = execute_sql(command, (get_jwt_identity(),), fetch_all = True)

    if result:
        playlists = []
        for r in result:
            playlists.append({'playlist_id': r['playlist_id'], 'title': r['title'], 'cover_picture_url': storage.generate_signed_url(r['cover_picture'])})

        return playlists, 200
    else:
        return {"error": "Couldn't fetch data!"}, 500
        

### Helper functions ###