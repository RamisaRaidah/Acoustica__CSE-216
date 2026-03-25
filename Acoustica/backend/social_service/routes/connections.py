from flask import Blueprint, jsonify
import logging
import sys

from flask_jwt_extended import get_jwt_identity, jwt_required

from social_service.services import connections
logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

connections_bp = Blueprint("connections", __name__) 

### follow_artist_route ###
@connections_bp.post("/api/connections/<int:artist_id>/follow-artist")
@jwt_required()
def follow_artist_route(artist_id):
    logging.info("reached follow route")
    listener_id = get_jwt_identity()
    result, status = connections.follow_artist(listener_id, artist_id)
    return jsonify(result), status

### check_follow_status_route ###
@connections_bp.get("/api/connections/<int:artist_id>/follow-check-status")
@jwt_required()
def check_follow_status_route(artist_id):
    listener_id = get_jwt_identity()
    result, status = connections.check_follow_status(listener_id, artist_id)
    return jsonify(result), status

### get_followed_artists_route ###
@connections_bp.get("/api/connections/me/followed-artists")
@jwt_required()
def get_followed_artists_route():
    listener_id = get_jwt_identity()
    result, status = connections.get_followed_artists()
    return jsonify(result), status