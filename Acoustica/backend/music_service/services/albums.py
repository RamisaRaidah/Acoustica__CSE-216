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

### create_album ###
def create_album(title, description, release_date, cover_picture, copyright_certificate, visibility):
    if not title or not release_date or not copyright_certificate or not visibility:
        return {"error": "missing data"}, 400
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "database connection failed"}, 500
    
    album_id = None
    cover_picture_ext = None
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT 1 FROM album WHERE LOWER(REPLACE(title, ' ', '')) = %s", (title.lower().replace(' ', ''),))

                if cursor.fetchone():
                    return {"error": "exists"}, 400
                
                # Uploading to db
                cursor.execute("""
                    INSERT INTO album (title, description, owner_id, release_date, cover_picture, visibility, copyright_certificate)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING album_id
                    """, (title, description, get_jwt_identity(), release_date, None, visibility, 'null')
                )
                album_id = cursor.fetchone()["album_id"]

                if not album_id:
                    raise Exception()
                
                # Uploading to cloud
                copyright_certificate_path = f"Docs/Copyright_Certificates/album{album_id}.pdf"
                success = storage.upload_file_to_storage(
                    copyright_certificate.stream,
                    copyright_certificate_path,
                    copyright_certificate.mimetype
                )

                if not success:
                    raise Exception()

                if cover_picture:
                    cover_picture_ext = storage.get_file_extension(cover_picture)
                    cover_picture_path = f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        cover_picture_path,
                        cover_picture.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                # Updating table
                cursor.execute("""
                    UPDATE album
                    SET copyright_certificate = %s
                    WHERE album_id = %s
                    """, (f"Docs/Copyright_Certificates/album{album_id}.pdf", album_id)
                )
                if cover_picture:
                    cursor.execute("""
                        UPDATE album
                        SET cover_picture = %s
                        WHERE album_id = %s
                        """, (f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}", album_id)
                    )

                connection.commit()
                
    except Exception as e:
        connection.rollback()
        if album_id:
            storage.delete_file_from_storage(f"Docs/Copyright_Certificates/album{album_id}.pdf")
        if cover_picture:
            storage.delete_file_from_storage(f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}")
        return {"error": "failed"}, 500
    
    finally:
        release_connection(connection)
    
    return {"message": "successful"}, 201

### get_albums ###
def get_albums():
    result = execute_sql(
        "SELECT album_id, title FROM album",
        fetch_all = True
    )

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_album_details ###
def get_album_details(album_id):
    album_id = int(album_id)

    result = execute_sql("""
        SELECT album_id, title, description, owner_id, stage_name owner_name, release_date, visibility, copyright_certificate , asset_id
        FROM album a JOIN artist ar ON (a.owner_id = ar.artist_id)
        WHERE album_id = %s
        """, (album_id,),
        fetch_one = True
    )

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return None, 200
    else:
        signed_url = storage.generate_signed_url(result["copyright_certificate"])
        if signed_url:
            result['copyright_certificate'] = signed_url
        else:
            result['copyright_certificate'] = "null"
            
        return result, 200
    
### get_album_cover_picture ###  
def get_album_cover_picture(album_id):
    result = execute_sql(
        "SELECT cover_picture FROM album WHERE album_id = %s", (album_id,),
        fetch_one = True
    )

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None or result['cover_picture'] is None:
        return {"cover_picture_url": "null"}, 200
    else:
        signed_url = storage.generate_signed_url(result["cover_picture"])
        if signed_url:
            return {"cover_picture_url": signed_url}, 200
        else:
            return {"cover_picture_url": "null"}, 200

### get_my_albums ### 
def get_my_albums():
    result = execute_sql(
        "SELECT album_id, title FROM album WHERE owner_id = %s", (get_jwt_identity(),),
        fetch_all = True
    )

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200

### get_album_songs ###
def get_album_songs(album_id):
    command = """
        SELECT s.song_id, s.title, s.album_id, a.title album_title, s.language_id, l.language_name language, s.length, s.release_date, s.lyrics, s.copyright_certificate, s.play_count, a.owner_id, ar.stage_name owner_name
        FROM song s JOIN album a ON (s.album_id = a.album_id) JOIN language l ON (s.language_id = l.language_id) JOIN artist ar ON (a.owner_id = ar.artist_id)
        WHERE a.album_id = %s
    """

    result = execute_sql(command, (album_id,), fetch_all = True)

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return [], 200
    else:
        return result, 200
    
### edit_album ###        
def edit_album(album_id, title, description, release_date, cover_picture, copyright_certificate, visibility, cover_action, copyright_certificate_action):
    if not title or not release_date or not visibility:
        return {"error": "missing data"}, 500
    
    connection = get_db_connection()

    if connection is None:
        return {"error": "couldn't connect to db"}, 500
    
    cover_picture_ext = None
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("""
                    SELECT 1 FROM album 
                    WHERE LOWER(REPLACE(title, ' ', '')) = %s AND album_id != %s
                """, (title.lower().replace(' ', ''), album_id))

                if cursor.fetchone():
                    return {"error": "exists"}, 409
                
                # Updating db                
                cursor.execute("""
                    UPDATE album 
                    SET title = %s, description = %s, release_date = %s, visibility = %s
                    WHERE album_id = %s
                """, (title, description, release_date, visibility, album_id)
                )
                
                # Uploading to cloud
                if cover_action == 'replace' and cover_picture:
                    # cursor.execute("SELECT cover_picture FROM album WHERE album_id = %s", (album_id,))
                    # cp = cursor.fetchone()['cover_picture']
                    # if cp:
                    #     storage.delete_file_from_storage(cp)

                    cover_picture_ext = storage.get_file_extension(cover_picture)
                    cover_picture_path = f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}"
                    success = storage.upload_file_to_storage(
                        cover_picture.stream,
                        cover_picture_path,
                        cover_picture.mimetype
                    )

                    if not success:
                        raise Exception()
                    
                    cursor.execute("""
                        UPDATE album
                        SET cover_picture = %s
                        WHERE album_id = %s
                        """, (f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}", album_id)
                    )
                    
                elif cover_action == 'replace' and not cover_picture:
                    cursor.execute("SELECT cover_picture FROM album WHERE album_id = %s", (album_id,))
                    cp = cursor.fetchone()['cover_picture']
                    if cp:
                        storage.delete_file_from_storage(cp)

                    cursor.execute("""
                        UPDATE album
                        SET cover_picture = NULL
                        WHERE album_id = %s
                        """, (album_id,)
                    )

                if copyright_certificate_action == 'replace' and copyright_certificate:
                    # cursor.execute("SELECT copyright_certificate FROM album WHERE album_id = %s", (album_id,))
                    # cc = cursor.fetchone()['copyright_certificate']
                    # if cc:
                    #     storage.delete_file_from_storage(cc)

                    copyright_certificate_path = f"Docs/Copyright_Certificates/album{album_id}.pdf"
                    success = storage.upload_file_to_storage(
                        copyright_certificate.stream,
                        copyright_certificate_path,
                        copyright_certificate.mimetype
                    )

                    if not success:
                        raise Exception()

    except Exception as e:
        connection.rollback()
        if cover_action == 'replace' and cover_picture:
            storage.delete_file_from_storage(f"Images/Cover_Pictures/album{album_id}.{cover_picture_ext}")
        if copyright_certificate_action == 'replace' and copyright_certificate:
            storage.delete_file_from_storage(f"Docs/Copyright_Certificates/album{album_id}.pdf")
        return {"error": "failed"}, 500
    finally:
        release_connection(connection)
    
    return {"message": "successful"}, 201

### delete_album ###
def delete_album(album_id):
    connection = get_db_connection()

    if connection is None:
        return {"error": "couldn't connect to db"}, 500
    
    try:
        with connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute("SELECT asset_id, cover_picture, copyright_certificate FROM album WHERE album_id = %s", (album_id,))
                
                result = cursor.fetchone()
                asset_id = result['asset_id']
                cover_picture = result['cover_picture']
                copyright_certificate = result['copyright_certificate']

                if not asset_id:
                    raise Exception()
                
                cursor.execute("DELETE FROM asset WHERE asset_id = %s", (asset_id,))

                if cover_picture:
                    storage.delete_file_from_storage(cover_picture)

                if copyright_certificate:
                    storage.delete_file_from_storage(copyright_certificate)

    except Exception as e:
        connection.rollback()
        return {"error": "failed"}
    
    finally:
        release_connection(connection)

    return {"message": "successful"}, 201

### like_album ###
def like_album(album_id):
    result = execute_sql(
        "SELECT 1 FROM liked_album WHERE listener_id = %s AND album_id = %s",
        (get_jwt_identity(), album_id),
        fetch_one=True
    )

    if result is None:
        success = execute_sql(
            "INSERT INTO liked_album (listener_id, album_id) VALUES (%s, %s)",
            (get_jwt_identity(), album_id)
        )
    else:
        success = execute_sql(
            "DELETE FROM liked_album WHERE listener_id = %s AND album_id = %s",
            (get_jwt_identity(), album_id)
        )

    if success is not None:
        return {'message': 'successful'}, 200
    return {'error': 'failed'}, 500

### is_liked ###
def is_liked(album_id):
    result = execute_sql(
        "SELECT 1 FROM liked_album WHERE listener_id = %s AND album_id = %s",
        (get_jwt_identity(), album_id),
        fetch_one=True
    )

    if result is False:
        return {"error": "couldn't fetch data"}, 500
    elif result is None:
        return False, 200
    else:
        return True, 200

def add_song_to_album(album_id,song_id):
    return (f"add_song_to_album {album_id} {song_id}")

def remove_song_from_album(album_id,song_id):
    return (f"remove_song_from_album {album_id} {song_id}")


def get_artist_albums(artist_id):
    albums_sql = """
        SELECT 
            al.album_id,
            al.title,
            al.cover_picture,
            COALESCE(SUM(s.play_count), 0) as total_plays
        FROM album al
        LEFT JOIN song s ON s.album_id = al.album_id
        WHERE al.owner_id = %s
        GROUP BY al.album_id, al.title, al.cover_picture
        ORDER BY total_plays DESC
        LIMIT 50
    """
    albums_result = execute_sql(albums_sql, (artist_id,), fetch_all=True)
    albums = []
    for al in (albums_result or []):
        album = dict(al)
        del album["total_plays"]
        album["cover_picture_url"] = storage.generate_signed_url(album["cover_picture"]) if album["cover_picture"] else None
        del album["cover_picture"]
        albums.append(album)

    logging.info(f"Fetched {len(albums)} albums for artist {artist_id}")
    return albums, 200

### Helper functions ###