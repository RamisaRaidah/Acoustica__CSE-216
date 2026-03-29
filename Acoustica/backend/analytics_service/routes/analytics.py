from flask import Blueprint, jsonify, request
import logging
import sys
from flask_jwt_extended import jwt_required

from analytics_service.services import analytics

logging.basicConfig(
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.get("/api/analytics/health")
def health():
    return jsonify("alive!!!")

@analytics_bp.get("/api/search/song")
@jwt_required()
def search_song_route():
    seed = request.args.get("q")
    logging.info(seed)
    if (seed == ""): 
        return jsonify(None), 200
    result, status = analytics.search_song(seed)
    return jsonify(result), status

@analytics_bp.get("/api/search/album")
@jwt_required()
def search_album_route():
    seed = request.args.get("q")
    if (seed == ""): 
        return jsonify(None), 200
    result, status = analytics.search_album(seed)
    return jsonify(result), status

@analytics_bp.get("/api/search/artist")
@jwt_required()
def search_artist_route():
    seed = request.args.get("q")
    if (seed == ""): 
        return jsonify(None), 200
    result, status = analytics.search_artist(seed)
    return jsonify(result), status

@analytics_bp.get("/api/analytics/me/song-recommendations")
@jwt_required()
def recommend_song_route():
    return jsonify(analytics.recommend_song())

@analytics_bp.get("/api/analytics/me/mixes")
@jwt_required()
def generate_mix_route():
    return jsonify("generate_mix")

@analytics_bp.get("/api/analytics/me/playlists")
@jwt_required()
def generate_playlist_route():
    return jsonify("generate_playlist")

@analytics_bp.get("/api/analytics/artists/<artist_id>/collaborator-recommendations")
@jwt_required()
def recommend_collaborators_route(artist_id):
    return jsonify(f"recommend_collaborators {artist_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>/audience-overlap")
@jwt_required()
def view_audience_overlap_route(artist_id):
    return jsonify(f"view_audience_overlap {artist_id}")

@analytics_bp.get("/api/analytics/listeners/<listener_id>")
@jwt_required()
def get_listener_analytics_route(listener_id):
    return jsonify(f"get_listener_analytics {listener_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>")
@jwt_required()
def get_artist_analytics_route(artist_id):
    return jsonify(f"get_artist_analytics {artist_id}")

@analytics_bp.get("/api/analytics/artists/<artist_id>/sales")
@jwt_required()
def get_artist_sales_stats_route(artist_id):
    return jsonify(f"get_artist_sales_stats {artist_id}")

@analytics_bp.get("/api/analytics/families/<family_id>")
@jwt_required()
def get_family_analytics_route(family_id):
    return jsonify(f"get_family_analytics {family_id}")

@analytics_bp.get("/api/analytics/countries")
@jwt_required()
def get_countries_route():
    result, status = analytics.get_countries()
    return jsonify(result), status
    
@analytics_bp.get("/api/analytics/languages")
@jwt_required()
def get_languages_route():
    result, status = analytics.get_languages()
    return jsonify(result), status
    
@analytics_bp.get("/api/analytics/genres")
@jwt_required()
def get_genres_route():
    result, status = analytics.get_genres()
    return jsonify(result), status

@analytics_bp.get("/api/analytics/moods")
@jwt_required()
def get_moods_route():
    result, status = analytics.get_moods()
    return jsonify(result), status

@analytics_bp.get("/api/analytics/instruments")
@jwt_required()
def get_instruments_route():
    result, status = analytics.get_instruments()
    return jsonify(result), status

### get_trending_songs_route ###
@analytics_bp.get("/api/analytics/trending-songs")
@jwt_required()
def get_trending_songs_route():
    result, status = analytics.get_trending_songs()
    return jsonify(result), status

### get_popular_songs_route ###
@analytics_bp.get("/api/analytics/popular-songs")
@jwt_required()
def get_popular_songs_route():
    result, status = analytics.get_popular_songs()
    return jsonify(result), status

### get_trending_artists_route ###
@analytics_bp.get("/api/analytics/trending-artists")
@jwt_required()
def get_trending_artists_route():
    result, status = analytics.get_trending_artists()
    return jsonify(result), status

### get_popular_artists_route ###
@analytics_bp.get("/api/analytics/popular-artists")
@jwt_required()
def get_popular_artists_route():
    result, status = analytics.get_popular_artists()
    return jsonify(result), status

### get_genre_trending_songs_route ###
@analytics_bp.get("/api/analytics/genre_trending_songs/<genre_id>")
@jwt_required()
def get_genre_trending_songs_route(genre_id):
    result, status = analytics.get_genre_trending_songs(genre_id)
    return jsonify(result), status

### get_genre_popular_songs_route ###
@analytics_bp.get("/api/analytics/genre_popular_songs/<genre_id>")
@jwt_required()
def get_genre_popular_songs_route(genre_id):
    result, status = analytics.get_genre_popular_songs(genre_id)
    return jsonify(result), status

### get_genre_my_songs_route ###
@analytics_bp.get("/api/analytics/genre_my_songs/<genre_id>")
@jwt_required()
def get_genre_my_songs_route(genre_id):
    result, status = analytics.get_genre_my_songs(genre_id)
    return jsonify(result), status

### get_mood_trending_songs_route ###
@analytics_bp.get("/api/analytics/mood_trending_songs/<mood_id>")
@jwt_required()
def get_mood_trending_songs_route(mood_id):
    result, status = analytics.get_mood_trending_songs(mood_id)
    return jsonify(result), status

### get_mood_popular_songs_route ###
@analytics_bp.get("/api/analytics/mood_popular_songs/<mood_id>")
@jwt_required()
def get_mood_popular_songs_route(mood_id):
    result, status = analytics.get_mood_popular_songs(mood_id)
    return jsonify(result), status

### get_mood_my_songs_route ###
@analytics_bp.get("/api/analytics/mood_my_songs/<mood_id>")
@jwt_required()
def get_mood_my_songs_route(mood_id):
    result, status = analytics.get_mood_my_songs(mood_id)
    return jsonify(result), status

### get_language_trending_songs_route ###
@analytics_bp.get("/api/analytics/language_trending_songs/<language_id>")
@jwt_required()
def get_language_trending_songs_route(language_id):
    result, status = analytics.get_language_trending_songs(language_id)
    return jsonify(result), status

### get_language_popular_songs_route ###
@analytics_bp.get("/api/analytics/language_popular_songs/<language_id>")
@jwt_required()
def get_language_popular_songs_route(language_id):
    result, status = analytics.get_language_popular_songs(language_id)
    return jsonify(result), status

### get_language_my_songs_route ###
@analytics_bp.get("/api/analytics/language_my_songs/<language_id>")
@jwt_required()
def get_language_my_songs_route(language_id):
    result, status = analytics.get_language_my_songs(language_id)
    return jsonify(result), status

### get_instrument_trending_songs_route ###
@analytics_bp.get("/api/analytics/instrument_trending_songs/<instrument_id>")
@jwt_required()
def get_instrument_trending_songs_route(instrument_id):
    result, status = analytics.get_instrument_trending_songs(instrument_id)
    return jsonify(result), status

### get_instrument_popular_songs_route ###
@analytics_bp.get("/api/analytics/instrument_popular_songs/<instrument_id>")
@jwt_required()
def get_instrument_popular_songs_route(instrument_id):
    result, status = analytics.get_instrument_popular_songs(instrument_id)
    return jsonify(result), status

### get_instrument_my_songs_route ###
@analytics_bp.get("/api/analytics/instrument_my_songs/<instrument_id>")
@jwt_required()
def get_instrument_my_songs_route(instrument_id):
    result, status = analytics.get_instrument_my_songs(instrument_id)
    return jsonify(result), status

@analytics_bp.get("/api/analytics/artists/<int:artist_id>/stats")
@jwt_required()
def get_artist_stats_route(artist_id):
    result, status = analytics.get_artist_stats(artist_id)
    return jsonify(result), status