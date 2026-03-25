from flask import Blueprint, jsonify
import logging
import sys
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request

from user_service.services import artists

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

artists_bp = Blueprint("artists", __name__)

@artists_bp.get("/api/artists/health")
def health():
    return jsonify("artists")

@artists_bp.get("/api/artists/me/dashboard")
@jwt_required()
def get_dashboard_route():
    return jsonify("get_dashboard")

@artists_bp.get("/api/artists/me")
@jwt_required()
def get_profile_route():
    return jsonify("get_profile")

@artists_bp.get("/api/artists")
@jwt_required()
def get_artists_route():
    result, status = artists.get_artists()
    return jsonify(result), status

### get_artist_info_route ###
@artists_bp.get("/api/artists/<int:artist_id>")
def get_artist_info_route(artist_id):
    viewer_id = None
    try:
        verify_jwt_in_request(optional=True)
        viewer_id = get_jwt_identity()
    except Exception:
        pass
    result, status = artists.get_artist_info(artist_id, viewer_id)
    return jsonify(result), status

### get_artist_song_metadata_route ###
@artists_bp.get("/api/artists/<int:artist_id>/song_metadata")
@jwt_required()
def get_artist_song_metadata_route(artist_id):
    result, status = artists.get_artist_song_metadata(artist_id)
    return jsonify(result), status