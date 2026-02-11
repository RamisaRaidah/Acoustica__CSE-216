from flask import Flask, jsonify
from dotenv import load_dotenv
from db import init_db
from flask_cors import CORS
import logging

from user_service.routes import auth, users, listeners, artists, admins
from music_service.routes import songs, albums, playlists
from commerce_service.routes import subscriptions, transactions, shop
from social_service.routes import activities, posts, social
from analytics_service.routes import analytics

load_dotenv()

logging.basicConfig(
    filename = "app.log",
    level = logging.INFO,
    format = "%(asctime)s [%(levelname)s] %(message)s"
)

app = Flask(__name__)
CORS(app)

app.register_blueprint(activities.activities_bp)
app.register_blueprint(admins.admins_bp)
app.register_blueprint(albums.albums_bp)
app.register_blueprint(analytics.analytics_bp)
app.register_blueprint(artists.artists_bp)
app.register_blueprint(auth.auth_bp)
app.register_blueprint(listeners.listeners_bp)
app.register_blueprint(playlists.playlists_bp)
app.register_blueprint(posts.posts_bp)
app.register_blueprint(shop.shop_bp)
app.register_blueprint(social.social_bp)
app.register_blueprint(songs.songs_bp)
app.register_blueprint(subscriptions.subscriptions_bp)
app.register_blueprint(transactions.transactions_bp)
app.register_blueprint(users.users_bp)

@app.route("/")
def home():
    return jsonify({"message": "This is backend"})

if __name__ == "__main__":
    # init_db()
    app.run(host = "0.0.0.0", port = 8000, debug = True)