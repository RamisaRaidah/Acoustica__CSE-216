from flask import Flask, jsonify
from dotenv import load_dotenv
from db import init_db, init_connection_pool
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import logging
import os
import sys


from user_service.routes import auth, users, listeners, artists, admins, notifications
from music_service.routes import songs, albums, playlists
from commerce_service.routes import subscriptions, transactions, shop
from social_service.routes import activities, posts, social, connections
from analytics_service.routes import analytics
from storage_service.routes import storage

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout
)

logging.info("This is a test log")

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*", 
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type", "Authorization"]
    }
})

init_connection_pool()
logging.info("Connection pool initialized")

app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.environ["JWT_ACCESS_TOKEN_EXPIRES"])

jwt = JWTManager(app)

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
app.register_blueprint(storage.storage_bp)
app.register_blueprint(notifications.notifications_bp)
app.register_blueprint(connections.connections_bp)

@app.route("/")
def home():
    return jsonify({"message": "This is backend"})

if __name__ == "__main__":
    # init_db()
    app.run(host = "0.0.0.0", port = 8000, debug = True)