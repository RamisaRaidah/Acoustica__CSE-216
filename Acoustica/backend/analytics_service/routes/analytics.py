from flask import Blueprint, jsonify
import logging
import sys

from analytics_service.services import analytics

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.get("/api/analytics/health")
def health():
    return jsonify("analytics")

@analytics_bp.get("/api/search")
def search_route():
    return jsonify("search")

@analytics_bp.get("/api/analytics/me/song-recommendations")
def recommend_song_route():
    return jsonify(analytics.recommend_song())

@analytics_bp.get("/api/analytics/me/mixes")
def generate_mix_route():
    return jsonify("generate_mix")

@analytics_bp.get("/api/analytics/me/playlists")
def generate_playlist_route():
    return jsonify("generate_playlist")

@analytics_bp.get("/api/analytics/artists/<artist_id>/collaborator-recommendations")
def recommend_collaborators_route(artist_id):
    return jsonify(f"recommend_collaborators {artist_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>/audience-overlap")
def view_audience_overlap_route(artist_id):
    return jsonify(f"view_audience_overlap {artist_id}")

@analytics_bp.get("/api/analytics/listeners/<listener_id>")
def get_listener_analytics_route(listener_id):
    return jsonify(f"get_listener_analytics {listener_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>")
def get_artist_analytics_route(artist_id):
    return jsonify(f"get_artist_analytics {artist_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>/sales")
def get_artist_sales_stats_route(artist_id):
    return jsonify(f"get_artist_sales_stats {artist_id}")

@analytics_bp.get("/api/analytics/families/<family_id>")
def get_family_analytics_route(family_id):
    return jsonify(f"get_family_analytics {family_id}")

@analytics_bp.get("/api/analytics/countries")
def get_countries_route():
    result, status = analytics.get_countries()
    return jsonify(result), status
    
@analytics_bp.get("/api/analytics/languages")
def get_languages_route():
    result, status = analytics.get_languages()
    return jsonify(result), status
    
@analytics_bp.get("/api/analytics/genres")
def get_genres_route():
    result, status = analytics.get_genres()
    return jsonify(result), status

@analytics_bp.get("/api/analytics/moods")
def get_moods_route():
    result, status = analytics.get_moods()
    return jsonify(result), status

@analytics_bp.get("/api/analytics/instruments")
def get_instruments_route():
    result, status = analytics.get_instruments()
    return jsonify(result), status