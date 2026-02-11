from flask import Blueprint, jsonify
import logging

from analytics_service.services import analytics

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.get("/api/analytics/health")
def health():
    return jsonify("analytics")

@analytics_bp.get("/api/search")
def search():
    return jsonify("search")

@analytics_bp.get("/api/analytics/me/song-recommendations")
def recommend_song():
    return jsonify("recommend_song")

@analytics_bp.get("/api/analytics/me/mixes")
def generate_mix():
    return jsonify("generate_mix")

@analytics_bp.get("/api/analytics/me/playlists")
def generate_playlist():
    return jsonify("generate_playlist")

@analytics_bp.get("/api/analytics/artists/<artist_id>/collaborator-recommendations")
def recommend_collaborators(artist_id):
    return jsonify(f"recommend_collaborators {artist_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>/audience-overlap")
def view_audience_overlap(artist_id):
    return jsonify(f"view_audience_overlap {artist_id}")

@analytics_bp.get("/api/analytics/listeners/<listener_id>")
def get_listener_analytics(listener_id):
    return jsonify(f"get_listener_analytics {listener_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>")
def get_artist_analytics(artist_id):
    return jsonify(f"get_artist_analytics {artist_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>/sales")
def get_artist_sales_stats(artist_id):
    return jsonify(f"get_artist_sales_stats {artist_id}")

@analytics_bp.get("/api/analytics/families/<family_id>")
def get_family_analytics(family_id):
    return jsonify(f"get_family_analytics {family_id}")