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

@connections_bp.post("/api/connections/<int:artist_id>/follow-artist")
@jwt_required()
def follow_artist_route(artist_id):
    logging.info("reached follow route")
    listener_id = get_jwt_identity()
    result, status = connections.follow_artist(listener_id, artist_id)
    return jsonify(result), status

@connections_bp.get("/api/connections/<int:artist_id>/follow-check-status")
@jwt_required()
def checkFollowStatus_route(artist_id):
    listener_id = get_jwt_identity()
    result, status = connections.checkFollowStatus(listener_id, artist_id)
    return jsonify(result), status
