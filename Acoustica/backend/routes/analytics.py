from flask import Blueprint, render_template, jsonify
from dotenv import load_dotenv
from db import execute_sql
import logging

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

analytics = Blueprint("analytics", __name__)

@analytics.get("/analytics")
def health():
    return jsonify("analytics")

@analytics.get("/api/search")
def search():
    return jsonify("search")

@analytics.get("/api/analytics/me/song-recommendations")
def recommend_song():
    return jsonify("recommend_song")

@analytics.get("/api/analytics/me/mixes")
def generate_mix():
    return jsonify("generate_mix")

@analytics.get("/api/analytics/me/playlists")
def generate_playlist():
    return jsonify("generate_playlist")

@analytics.get("/api/analytics/listeners/<listener_id>")
def get_listener_analytics(listener_id):
    return jsonify(f"get_listener_analytics {listener_id}")

@analytics.get("/api/analytics/families/<family_id>")
def get_family_analytics(family_id):
    return jsonify(f"get_family_analytics {family_id}")

@analytics.get("/api/analytics/artists/<artist_id>")
def get_artist_analytics(artist_id):
    return jsonify(f"get_artist_analytics {artist_id}")

@analytics.get("/api/analytics/artists/<artist_id>/sales")
def get_artist_sales_stats(artist_id):
    return jsonify(f"get_artist_sales_stats {artist_id}")

@analytics.get("/api/analytics/artists/<artist_id>/collaborator-recommendations")
def recommend_collaborators():
    return jsonify("recommend_collaborators")

@analytics.get("/api/analytics/artists/<artist_id>/audience-overlap")
def view_audience_overlap():
    return jsonify("view_audience_overlap")